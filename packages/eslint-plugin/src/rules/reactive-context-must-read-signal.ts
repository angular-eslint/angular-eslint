import {
  AST_NODE_TYPES,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import ts from 'typescript';
import { createESLintRule } from '../utils/create-eslint-rule';
import { KNOWN_SIGNAL_TYPES } from '../utils/signals';

export type Options = [
  {
    readonly checkResources?: boolean;
    readonly followLocalCalls?: boolean;
  },
];
export type MessageIds = 'mustReadSignal';
export const RULE_NAME = 'reactive-context-must-read-signal';

type ReactiveFunction =
  TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

/**
 * A function declared in the linted file that `followLocalCalls` can look inside.
 */
type LocalFunction = TSESTree.FunctionDeclaration | ReactiveFunction;

/** The TypeScript nodes that `tsNodeToESTreeNodeMap` maps to ESTree nodes. */
type TSNode = Parameters<
  ParserServicesWithTypeInformation['tsNodeToESTreeNodeMap']['get']
>[0];

interface PrimitiveConfig {
  /** Positional argument indices that hold a tracked reactive function. */
  readonly args: readonly number[];
  /** Option-object keys whose function value is a tracked reactive function. */
  readonly optionKeys: readonly string[];
}

/**
 * Reactive contexts that should depend on at least one signal. The tracked
 * function is the one whose signal reads define the context's dependencies:
 * - `computed`/`effect`: the first argument.
 * - `linkedSignal`: the first argument (shorthand) or the `source`/`computation`
 *   functions of the options object.
 * - `afterRenderEffect`: the first argument (shorthand) or the phase functions
 *   of the options object.
 */
const DEFAULT_PRIMITIVES: Readonly<Record<string, PrimitiveConfig>> = {
  afterRenderEffect: {
    args: [0],
    optionKeys: ['earlyRead', 'write', 'mixedReadWrite', 'read'],
  },
  computed: { args: [0], optionKeys: [] },
  effect: { args: [0], optionKeys: [] },
  linkedSignal: { args: [0], optionKeys: ['source', 'computation'] },
};

/**
 * For resources, only the `params` (formerly `request`) function defines the
 * reactive dependencies; reading a signal in the `loader`/`stream` does not make
 * the resource reload. These are opt-in via the `checkResources` option.
 */
const RESOURCE_PRIMITIVES: Readonly<Record<string, PrimitiveConfig>> = {
  resource: { args: [0], optionKeys: ['params', 'request'] },
  rxResource: { args: [0], optionKeys: ['params', 'request'] },
};

/** Guards against a stack overflow on a very deep chain of local calls. */
const MAX_FOLLOW_DEPTH = 50;

const PRIMITIVE_TYPE_FLAGS =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.ESSymbolLike |
  ts.TypeFlags.VoidLike |
  ts.TypeFlags.Null;

interface CallAnalysis {
  readonly call: TSESTree.CallExpression;
  readonly primitiveName: string;
  /** Whether the call has at least one tracked function to analyse. */
  hasTrackedFn: boolean;
  /** Whether a reactive (signal) read was seen in any tracked function. */
  hasReactiveRead: boolean;
  /**
   * Whether something we cannot analyse was seen in any tracked function. It
   * could read a signal on our behalf, so we must not report in that case.
   */
  hasUnknown: boolean;
}

/** The part of the analysis that is also recorded for a followed function. */
type Findings = Pick<CallAnalysis, 'hasReactiveRead' | 'hasUnknown'>;

function isFunction(
  node: TSESTree.Node | null | undefined,
): node is ReactiveFunction {
  return (
    node?.type === AST_NODE_TYPES.FunctionExpression ||
    node?.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
}

function isNode(value: unknown): value is TSESTree.Node {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that reactive contexts such as computed(), linkedSignal() and effect() read at least one reactive value (a signal). A reactive context with no reactive dependencies never re-runs, which is almost always a mistake.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkResources: {
            type: 'boolean',
            description:
              'Also check that the `params` function of `resource()` and `rxResource()` reads a signal.',
          },
          followLocalCalls: {
            type: 'boolean',
            description:
              'Look inside functions declared in the same file, and inside `private`/`#private` methods and getters, that a reactive context calls, instead of assuming that they might read a signal.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      mustReadSignal:
        '{{primitive}}() must read at least one signal, otherwise it will never re-run when state changes.',
    },
  },
  defaultOptions: [{ checkResources: false, followLocalCalls: false }],
  create(context, [{ checkResources = false, followLocalCalls = false }]) {
    const services: ParserServicesWithTypeInformation =
      ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    const primitives: Readonly<Record<string, PrimitiveConfig>> = checkResources
      ? { ...DEFAULT_PRIMITIVES, ...RESOURCE_PRIMITIVES }
      : DEFAULT_PRIMITIVES;

    const analyses = new Map<TSESTree.CallExpression, CallAnalysis>();
    const trackedFnToCall = new Map<
      ReactiveFunction,
      TSESTree.CallExpression
    >();
    const frameStack: {
      fn: ReactiveFunction;
      call: TSESTree.CallExpression;
    }[] = [];
    /** Results for followed local functions, so each is walked only once. */
    const summaries = new WeakMap<LocalFunction, Findings>();
    /** The local functions that are being followed, to detect recursion. */
    const following = new Set<LocalFunction>();
    /** The members that the file assigns to, e.g. `this.label = ...`. */
    let assignedMembers: Set<ts.Declaration> | undefined;

    /**
     * Returns true if calling `callee` reads a signal, i.e. `callee` has one of
     * the known signal types. This mirrors the detection used by
     * `no-uncalled-signals`.
     */
    function isSignalRead(callee: TSESTree.Node): boolean {
      const type = services.getTypeAtLocation(callee);
      const symbol = type.getSymbol();

      if (symbol && KNOWN_SIGNAL_TYPES.has(symbol.name)) {
        return true;
      }

      // The `Signal` type is a type alias, so it is only reachable via the
      // alias symbol. Other signal types (e.g. `InputSignal`) are interfaces
      // and are found through `getSymbol()` above.
      if (type.aliasSymbol && KNOWN_SIGNAL_TYPES.has(type.aliasSymbol.name)) {
        return true;
      }

      return false;
    }

    /**
     * Returns true if the symbol is only declared in TypeScript's default
     * library files. Those declarations (arrays, strings, `Math`, `JSON`,
     * `Object`, `console`, DOM APIs, ...) cannot read an Angular signal.
     */
    function isDeclaredInDefaultLib(symbol: ts.Symbol): boolean {
      const declarations = symbol.getDeclarations();
      return (
        !!declarations?.length &&
        declarations.every((declaration) =>
          services.program.isSourceFileDefaultLibrary(
            declaration.getSourceFile(),
          ),
        )
      );
    }

    /**
     * Returns true if the node is a function-typed value that we cannot look
     * inside, e.g. `this.transform` in `this.items.map(this.transform)`. The
     * callee could invoke it, and it could read a signal.
     */
    function isOpaqueFunctionValue(node: TSESTree.Node): boolean {
      if (isFunction(node)) {
        // Inline functions are visited by this rule, so any signal they read is
        // attributed to the enclosing reactive context.
        return false;
      }
      if (node.type === AST_NODE_TYPES.SpreadElement) {
        // We cannot tell what a spread expands to, so assume the worst.
        return true;
      }
      const type = services.getTypeAtLocation(node);
      if (
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ) {
        // We know nothing about the value, so it could well be a function
        // that reads a signal.
        return true;
      }
      return tsutils
        .unionConstituents(type)
        .some((constituent) => constituent.getCallSignatures().length > 0);
    }

    /**
     * Returns true if the property with the given name is a getter on any
     * constituent of the type. A getter runs arbitrary code, so it can read a
     * signal even though reading the property does not look like a call.
     */
    function isGetter(type: ts.Type, name: string): boolean {
      return tsutils.unionConstituents(type).some((constituent) => {
        const property = constituent.getProperty(name);
        return (
          property !== undefined &&
          tsutils.isSymbolFlagSet(property, ts.SymbolFlags.GetAccessor)
        );
      });
    }

    /**
     * Records what a call, `new` expression or tagged template tells us about
     * the reactive context we are currently inside. It is only known not to
     * read a signal when the callee resolves to a declaration in a TypeScript
     * default library and no argument is an opaque function value.
     * With `followLocalCalls`, a local function that a call (`call`) runs, or
     * that the standard library is handed, is looked inside as well.
     */
    function analyseCallLike(
      callee: TSESTree.Node,
      args: readonly TSESTree.Node[],
      findings: Findings,
      call?: TSESTree.CallExpression,
    ): void {
      let symbol = services.getSymbolAtLocation(callee);
      if (symbol && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
        symbol = checker.getAliasedSymbol(symbol);
      }
      if (
        symbol &&
        isDeclaredInDefaultLib(symbol) &&
        // `fn.call()` and `fn.apply()` run `fn`, which can read a signal.
        // Any other standard library `call`/`apply`, such as `Reflect.apply()`,
        // also runs a function it is given.
        symbol.name !== 'call' &&
        symbol.name !== 'apply'
      ) {
        // The standard library cannot read a signal itself, but it can call a
        // function value it is handed.
        for (const arg of args) {
          if (
            isOpaqueFunctionValue(arg) &&
            !(
              followLocalCalls &&
              getsOnlyPlainValues(callee, args, arg) &&
              followLocalFunction(arg, 'method', findings, false)
            )
          ) {
            findings.hasUnknown = true;
          }
        }
      } else if (
        // The type of a `new` expression is not the return type of the
        // function, and a tagged template is called with the strings array
        // first, not with the arguments in the source.
        !call ||
        !followLocalFunction(
          callee,
          'method',
          findings,
          isResultUnread(call),
          call.arguments,
        )
      ) {
        findings.hasUnknown = true;
      }
    }

    /**
     * Whether the receiver and the other arguments of a library call are
     * plain. The library can pass them on to `fn`, also as its `this`. A
     * callee in another form, like `(items?.map)(fn)`, hides the receiver.
     */
    function getsOnlyPlainValues(
      callee: TSESTree.Node,
      args: readonly TSESTree.Node[],
      fn: TSESTree.Node,
    ): boolean {
      const values =
        callee.type === AST_NODE_TYPES.MemberExpression
          ? [callee.object, ...args]
          : args;
      return (
        (callee.type === AST_NODE_TYPES.MemberExpression ||
          callee.type === AST_NODE_TYPES.Identifier) &&
        values.every(
          (value) => value === fn || isPlain(services.getTypeAtLocation(value)),
        )
      );
    }

    /**
     * With `followLocalCalls`, adds what the local function behind
     * `reference` does to `findings`, as if its body were part of the tracked
     * function. Returns false if there is no local function that is safe to
     * look inside. Without `args`, the function is only referred to, and
     * something else calls it.
     */
    function followLocalFunction(
      reference: TSESTree.Node,
      kind: 'method' | 'get',
      findings: Findings,
      resultUnread: boolean,
      args?: readonly TSESTree.Node[],
    ): boolean {
      const fn = followLocalCalls
        ? resolveLocalFunction(reference, kind, resultUnread, args)
        : undefined;
      if (!fn) {
        return false;
      }
      const summary = summarize(fn);
      findings.hasReactiveRead ||= summary.hasReactiveRead;
      findings.hasUnknown ||= summary.hasUnknown;
      return true;
    }

    /**
     * Returns the local function that `reference` calls or reads, or
     * undefined if it is not safe to look inside.
     */
    function resolveLocalFunction(
      reference: TSESTree.Node,
      kind: 'method' | 'get',
      resultUnread: boolean,
      args: readonly TSESTree.Node[] | undefined,
    ): LocalFunction | undefined {
      const declarations = (
        services.getSymbolAtLocation(reference)?.getDeclarations() ?? []
      ).map((declaration): TSESTree.Node | undefined =>
        // Only nodes of the linted file are in this map.
        services.tsNodeToESTreeNodeMap.get(declaration as TSNode),
      );
      // What a member is accessed on.
      const receiver = services.getTypeAtLocation(
        reference.type === AST_NODE_TYPES.MemberExpression
          ? reference.object
          : reference,
      );
      const implementations = declarations.flatMap(
        (node) => toLocalFunction(node, kind, receiver) ?? [],
      );
      const [fn] = implementations;
      // An overload signature, or the setter of a getter, declares types that
      // a caller sees instead of the types of the implementation.
      const isRedeclared = declarations.length > 1;
      return implementations.length === 1 &&
        declarations.every(hasNoDecoratorOrAnnotation) &&
        fn.params.every(isNamedParameter) &&
        // A declared type predicate retypes expressions of the caller.
        !declaresTypePredicate(reference) &&
        (args
          ? args.every((arg, index) => isTrustedArgument(arg, fn.params[index]))
          : // The function is only passed along, so we know neither its
            // arguments nor its `this`: require primitive parameters and a
            // body without `this`.
            fn.params.every((param) =>
              isPrimitive(services.getTypeAtLocation(param)),
            ) && !mentionsThis(services.esTreeNodeToTSNodeMap.get(fn))) &&
        // The type of the result only matters if the result is read.
        (resultUnread || hasTrustedResult(fn, isRedeclared))
        ? fn
        : undefined;
    }

    /**
     * The function that a declaration implements, if it is safe to follow: a
     * subclass cannot override it, and a member is used on its own `this`.
     */
    function toLocalFunction(
      node: TSESTree.Node | undefined,
      kind: 'method' | 'get',
      receiver: ts.Type,
    ): LocalFunction | undefined {
      switch (node?.type) {
        case AST_NODE_TYPES.FunctionDeclaration:
          return node;
        case AST_NODE_TYPES.VariableDeclarator:
          return node.parent.kind === 'const' && isFunction(node.init)
            ? node.init
            : undefined;
        case AST_NODE_TYPES.MethodDefinition:
          return node.kind === kind &&
            node.value.type === AST_NODE_TYPES.FunctionExpression &&
            receiver === getThisType(node) &&
            // A `private` method is an ordinary property and can be assigned
            // to. A `#private` method and a getter cannot.
            (node.key.type === AST_NODE_TYPES.PrivateIdentifier ||
              (node.accessibility === 'private' &&
                (kind === 'get' || !isAssigned(node))))
            ? node.value
            : undefined;
        default:
          return undefined;
      }
    }

    /** Returns the type of `this` in the member: the class, if it is static. */
    function getThisType(
      member: TSESTree.MethodDefinition,
    ): ts.Type | undefined {
      const { symbol } = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(member.parent.parent),
      );
      return member.static
        ? checker.getTypeOfSymbol(symbol)
        : (checker.getDeclaredTypeOfSymbol(symbol) as ts.InterfaceType)
            .thisType;
    }

    // `super` counts as well.
    function mentionsThis(node: ts.Node): boolean {
      return (
        node.kind === ts.SyntaxKind.ThisKeyword ||
        node.kind === ts.SyntaxKind.SuperKeyword ||
        !!ts.forEachChild(node, mentionsThis)
      );
    }

    /**
     * A decorator can replace a method, and an annotation on the variable
     * retypes the function.
     */
    function hasNoDecoratorOrAnnotation(
      node: TSESTree.Node | undefined,
    ): boolean {
      switch (node?.type) {
        case AST_NODE_TYPES.MethodDefinition:
          return node.decorators.length === 0;
        case AST_NODE_TYPES.VariableDeclarator:
          return !node.id.typeAnnotation;
        default:
          return true;
      }
    }

    /**
     * Returns true for a plain name other than `this` whose default value,
     * if any, is trusted. A `this` parameter would retype the receiver.
     */
    function isNamedParameter(param: TSESTree.Parameter): boolean {
      return param.type === AST_NODE_TYPES.AssignmentPattern
        ? isNamedParameter(param.left) &&
            isTrustedArgument(param.right, param.left)
        : param.type === AST_NODE_TYPES.Identifier && param.name !== 'this';
    }

    function isTrustedArgument(
      arg: TSESTree.Node,
      param: TSESTree.Parameter | undefined,
    ): boolean {
      return (
        arg.type !== AST_NODE_TYPES.SpreadElement &&
        isTrusted(
          services.getTypeAtLocation(arg),
          param && services.getTypeAtLocation(param),
        )
      );
    }

    /**
     * Returns true if the type is plain or is exactly `declared`. `any` and
     * `unknown` never match. A wider declared type could hide a getter that
     * reads a signal.
     */
    function isTrusted(type: ts.Type, declared: ts.Type | undefined): boolean {
      return (
        isPlain(type) ||
        (type === declared &&
          !tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown))
      );
    }

    /**
     * Returns true if a signature that a caller of `reference` sees declares
     * a type predicate, like `value is Item` or `asserts this is Item`.
     */
    function declaresTypePredicate(reference: TSESTree.Node): boolean {
      return services
        .getTypeAtLocation(reference)
        .getCallSignatures()
        .some(
          ({ declaration }) =>
            !!declaration?.type && ts.isTypePredicateNode(declaration.type),
        );
    }

    /**
     * Returns true if the type of the result cannot hide what a caller reads
     * from it (see `isTrusted`).
     */
    function hasTrustedResult(
      fn: LocalFunction,
      isRedeclared: boolean,
    ): boolean {
      const body = services.esTreeNodeToTSNodeMap.get(fn.body);
      const returned: ts.Node[] = [];
      const collect = (node: ts.Node): void => {
        if (ts.isReturnStatement(node) && node.expression) {
          returned.push(node.expression);
        } else if (!ts.isFunctionLike(node)) {
          // A nested function returns to its own caller.
          ts.forEachChild(node, collect);
        }
      };
      if (ts.isBlock(body)) {
        collect(body);
      } else {
        returned.push(body);
      }
      const types = returned.map((value) => checker.getTypeAtLocation(value));
      // Another declaration (an overload, a setter) types the result for the
      // caller, so there is no declared type that a value could match.
      const declared =
        !isRedeclared && fn.returnType
          ? services.getTypeAtLocation(fn.returnType.typeAnnotation)
          : undefined;
      return (
        // What a generator yields is not checked.
        !fn.generator &&
        (isRedeclared || fn.returnType
          ? types.every((type) => isTrusted(type, declared))
          : // An inferred type reduces a class and an interface that it
            // implements to the interface, so all objects must have one type.
            new Set(types.flatMap(getObjectTypes)).size <= 1)
      );
    }

    function getObjectTypes(type: ts.Type): ts.Type[] {
      return tsutils
        .unionConstituents(type)
        .filter((part) => !isPrimitive(part));
    }

    /**
     * Whether nothing in the reactive context reads the result: the call is
     * a statement, or a tracked function that is passed directly to the
     * reactive context returns it. In an options object, `computation` gets
     * what `source` returns.
     */
    function isResultUnread(node: TSESTree.Node): boolean {
      const { parent } = node;
      if (parent?.type === AST_NODE_TYPES.ExpressionStatement) {
        return true;
      }
      // The body of an arrow function, or a `return` at the top of a block.
      const fn =
        parent?.type === AST_NODE_TYPES.ReturnStatement
          ? parent.parent.parent
          : parent;
      return isFunction(fn) && isDirectArgument(fn, trackedFnToCall.get(fn));
    }

    function isDirectArgument(
      node: TSESTree.Node,
      call: TSESTree.CallExpression | undefined,
    ): boolean {
      return !!call?.arguments.some((arg) => arg === node);
    }

    function isPrimitive(type: ts.Type): boolean {
      return tsutils
        .unionConstituents(type)
        .every((part) => tsutils.isTypeFlagSet(part, PRIMITIVE_TYPE_FLAGS));
    }

    /**
     * A primitive, or an array, tuple or `Promise` of primitives: a value
     * that runs only standard library code. Not nested, so that a recursive
     * type terminates.
     */
    function isPlain(type: ts.Type): boolean {
      return tsutils.unionConstituents(type).every((part) => {
        const symbol = part.getSymbol();
        return (
          isPrimitive(part) ||
          (tsutils.isTypeReference(part) &&
            (checker.isArrayType(part) ||
              checker.isTupleType(part) ||
              (symbol?.name === 'Promise' && isDeclaredInDefaultLib(symbol))) &&
            checker.getTypeArguments(part).every(isPrimitive))
        );
      });
    }

    /**
     * Whether the file assigns to the method, as in `this.label = ...`. A
     * key that is not a single string literal can name any member.
     */
    function isAssigned(method: TSESTree.MethodDefinition): boolean {
      if (!assignedMembers) {
        const declarations = new Set<ts.Declaration>();
        const collect = (node: ts.Node): void => {
          if (
            (ts.isPropertyAccessExpression(node) ||
              ts.isElementAccessExpression(node)) &&
            tsutils.getAccessKind(node) !== tsutils.AccessKind.Read
          ) {
            for (const symbol of getAccessedMembers(node)) {
              symbol
                ?.getDeclarations()
                ?.forEach((declaration) => declarations.add(declaration));
            }
          }
          ts.forEachChild(node, collect);
        };
        collect(services.esTreeNodeToTSNodeMap.get(context.sourceCode.ast));
        assignedMembers = declarations;
      }
      return assignedMembers.has(services.esTreeNodeToTSNodeMap.get(method));
    }

    function getAccessedMembers(
      node: ts.PropertyAccessExpression | ts.ElementAccessExpression,
    ): (ts.Symbol | undefined)[] {
      if (ts.isPropertyAccessExpression(node)) {
        return [checker.getSymbolAtLocation(node.name)];
      }
      const object = checker.getApparentType(
        checker.getTypeAtLocation(node.expression),
      );
      const key = checker.getTypeAtLocation(node.argumentExpression);
      return key.isStringLiteral()
        ? [object.getProperty(key.value)]
        : object.getProperties();
    }

    /**
     * Checks a followed local function the same way as an inline tracked
     * function. Recursion and a chain of calls that gets too deep are unknown.
     */
    function summarize(fn: LocalFunction): Findings {
      let findings = summaries.get(fn);
      if (findings) {
        return findings;
      }
      if (following.has(fn) || following.size >= MAX_FOLLOW_DEPTH) {
        // Unknown, so that a function in a cycle is not cached as reading no
        // signal.
        return { hasReactiveRead: false, hasUnknown: true };
      }
      findings = { hasReactiveRead: false, hasUnknown: false };
      following.add(fn);
      walk(fn, findings);
      following.delete(fn);
      summaries.set(fn, findings);
      return findings;
    }

    /** Inspects the node and everything in it, until the outcome is clear. */
    function walk(node: TSESTree.Node, findings: Findings): void {
      const keys = context.sourceCode.visitorKeys[node.type] as
        readonly string[] | undefined;
      if (
        // The parser also produces nodes that it has no keys for.
        !keys ||
        // `arguments` holds every argument as `any`.
        (node.type === AST_NODE_TYPES.Identifier && node.name === 'arguments')
      ) {
        findings.hasUnknown = true;
        return;
      }
      inspect(node, findings);
      for (const key of keys) {
        // A key holds a node, a list of nodes, or nothing.
        const value: unknown = (node as unknown as Record<string, unknown>)[
          key
        ];
        for (const child of Array.isArray(value) ? value : [value]) {
          if (findings.hasReactiveRead || findings.hasUnknown) {
            // Either way, the reactive context will not be reported.
            return;
          }
          if (isNode(child)) {
            walk(child, findings);
          }
        }
      }
    }

    /** Records what a node inside a tracked or followed function tells us. */
    function inspect(node: TSESTree.Node, findings: Findings): void {
      switch (node.type) {
        case AST_NODE_TYPES.CallExpression:
          if (isSignalRead(node.callee)) {
            findings.hasReactiveRead = true;
          } else {
            analyseCallLike(node.callee, node.arguments, findings, node);
          }
          break;
        case AST_NODE_TYPES.NewExpression:
          analyseCallLike(node.callee, node.arguments, findings);
          break;
        case AST_NODE_TYPES.TaggedTemplateExpression:
          analyseCallLike(node.tag, node.quasi.expressions, findings);
          break;
        case AST_NODE_TYPES.MemberExpression:
          inspectMemberExpression(node, findings);
          break;
        case AST_NODE_TYPES.ObjectPattern:
          inspectObjectPattern(node, findings);
          break;
      }
    }

    function inspectMemberExpression(
      node: TSESTree.MemberExpression,
      findings: Findings,
    ): void {
      // A getter runs arbitrary code, so `this.name` can read a signal even
      // though it does not look like a call.
      const symbol = services.getSymbolAtLocation(node);
      if (
        symbol &&
        tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.GetAccessor) &&
        // Only a plain read is followed, because a write runs the setter
        // instead.
        (tsutils.getAccessKind(services.esTreeNodeToTSNodeMap.get(node)) !==
          tsutils.AccessKind.Read ||
          // The caller may have narrowed the type before the getter ran
          // again, and it can return another object each time.
          !isSameSet(
            getObjectTypes(services.getTypeAtLocation(node)),
            getObjectTypes(checker.getTypeOfSymbol(symbol)),
          ) ||
          !followLocalFunction(node, 'get', findings, isResultUnread(node), []))
      ) {
        findings.hasUnknown = true;
      }
    }

    function isSameSet(a: readonly ts.Type[], b: readonly ts.Type[]): boolean {
      return a.length === b.length && a.every((type) => b.includes(type));
    }

    function inspectObjectPattern(
      node: TSESTree.ObjectPattern,
      findings: Findings,
    ): void {
      // Destructuring invokes getters just like a member expression does,
      // e.g. `const { double } = this`.
      const type = services.getTypeAtLocation(node);
      for (const property of node.properties) {
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.computed ||
          property.key.type !== AST_NODE_TYPES.Identifier
        ) {
          // A rest element copies every property and a computed or literal
          // key can name any property, so assume a getter could be involved.
          findings.hasUnknown = true;
        } else if (isGetter(type, property.key.name)) {
          findings.hasUnknown = true;
        }
      }
    }

    /** The analysis of the reactive context we are currently inside, if any. */
    function currentAnalysis(): CallAnalysis | undefined {
      const top = frameStack[frameStack.length - 1];
      return top && analyses.get(top.call);
    }

    /** Inspects a node for the tracked function we are inside, if any. */
    function inspectInCurrentContext(node: TSESTree.Node): void {
      const analysis = currentAnalysis();
      if (analysis) {
        inspect(node, analysis);
      }
    }

    function registerTrackedFunction(
      node: TSESTree.Node,
      call: TSESTree.CallExpression,
      analysis: CallAnalysis,
    ): void {
      if (isFunction(node)) {
        trackedFnToCall.set(node, call);
        analysis.hasTrackedFn = true;
      } else if (
        // With `followLocalCalls`, e.g. `computed(compute)` where `compute` is
        // declared in this file. Only a direct argument qualifies, because
        // Angular reads nothing from its result (see `isResultUnread`).
        isDirectArgument(node, call) &&
        followLocalFunction(node, 'method', analysis, true)
      ) {
        analysis.hasTrackedFn = true;
      } else {
        // The tracked slot holds something we cannot look inside, such as a
        // signal passed directly as `source`, or a reference to a function
        // declared elsewhere. It may well be reactive, so stay silent.
        analysis.hasUnknown = true;
      }
    }

    function registerTrackedOptions(
      options: TSESTree.ObjectExpression,
      call: TSESTree.CallExpression,
      config: PrimitiveConfig,
      analysis: CallAnalysis,
    ): void {
      for (const property of options.properties) {
        if (property.type === AST_NODE_TYPES.SpreadElement) {
          // The spread could provide any of the tracked options.
          analysis.hasUnknown = true;
        } else if (
          !property.computed &&
          property.key.type === AST_NODE_TYPES.Identifier &&
          config.optionKeys.includes(property.key.name)
        ) {
          registerTrackedFunction(property.value, call, analysis);
        }
      }
    }

    function registerTrackedFunctions(
      call: TSESTree.CallExpression,
      config: PrimitiveConfig,
      analysis: CallAnalysis,
    ): void {
      for (const index of config.args) {
        const arg = call.arguments[index];
        if (arg === undefined) {
          continue;
        }
        if (
          config.optionKeys.length > 0 &&
          arg.type === AST_NODE_TYPES.ObjectExpression
        ) {
          registerTrackedOptions(arg, call, config, analysis);
        } else {
          registerTrackedFunction(arg, call, analysis);
        }
      }
    }

    function enterFunction(node: ReactiveFunction): void {
      const call = trackedFnToCall.get(node);
      if (call) {
        frameStack.push({ fn: node, call });
      }
    }

    function exitFunction(node: ReactiveFunction): void {
      const top = frameStack[frameStack.length - 1];
      if (top?.fn === node) {
        frameStack.pop();
      }
    }

    return {
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,

      MemberExpression: inspectInCurrentContext,
      ObjectPattern: inspectInCurrentContext,
      NewExpression: inspectInCurrentContext,
      TaggedTemplateExpression: inspectInCurrentContext,

      CallExpression(node: TSESTree.CallExpression) {
        // Attribute this call to the tracked function we are currently inside,
        // if any. This runs before registration below, so a reactive context
        // nested inside another tracked function is correctly treated as an
        // (unknown) call of the outer function.
        inspectInCurrentContext(node);

        // Register this call if it is one of the reactive contexts.
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          !Object.hasOwn(primitives, node.callee.name)
        ) {
          return;
        }
        const config = primitives[node.callee.name];

        const newAnalysis: CallAnalysis = {
          call: node,
          primitiveName: node.callee.name,
          hasTrackedFn: false,
          hasReactiveRead: false,
          hasUnknown: false,
        };
        registerTrackedFunctions(node, config, newAnalysis);
        analyses.set(node, newAnalysis);
      },

      'CallExpression:exit'(node: TSESTree.CallExpression) {
        const analysis = analyses.get(node);
        if (!analysis) {
          return;
        }
        analyses.delete(node);

        // Only report when we are certain there is no reactivity: there is a
        // tracked function, no signal was read, and there was nothing that
        // might have read a signal on our behalf.
        if (
          analysis.hasTrackedFn &&
          !analysis.hasReactiveRead &&
          !analysis.hasUnknown
        ) {
          context.report({
            node: analysis.call,
            messageId: 'mustReadSignal',
            data: { primitive: analysis.primitiveName },
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Reactive contexts like `computed()`, `linkedSignal()`, `effect()` and `afterRenderEffect()` re-run whenever a signal they read changes. If the relevant function never reads a signal, the context runs once and can never react to anything, so it adds overhead without providing reactivity. This is usually a mistake: either the developer forgot to call a signal (e.g. wrote `firstName` instead of `firstName()`), or the value is actually static and should be a plain constant, a `signal()`, or an `afterNextRender()` in the case of `afterRenderEffect()`. To avoid false positives, the rule only reports when everything the tracked function does is known not to read a signal. Calls into the TypeScript standard library (arrays, strings, `Math`, `JSON`, `console`, DOM APIs, etc.) are known to be safe, except `call()` and `apply()`, which run the function they are called on. Anything else keeps the rule silent, including a helper function, a service method, a getter, an unresolved symbol, and any Angular API such as `untracked()`. With the `followLocalCalls` option, the rule also looks inside functions declared in the same file (a declaration or an unannotated `const`) and inside `private` and `#private` methods and getters used on `this`, so `computed(() => this.label())` is reported when `label()` does not read a signal either. It stays silent when it cannot be sure which code runs (a function from another file, an overridable public or protected member, a decorated member), when the function is a type guard, and when an object argument or result does not have exactly the declared type, which could hide a getter that reads a signal. One known limitation: a standard library call that reaches user code through a protocol method, such as `toJSON()` in `JSON.stringify()` or `toString()` in a template literal, is still treated as safe, so a signal read inside such a method is not detected. Likewise, with `followLocalCalls`, a `private` method or getter that is replaced at runtime, such as by a class decorator or `Object.defineProperty()`, is checked as it is declared. For `resource()`/`rxResource()` only the `params` function defines the dependencies, and these are opt-in via the `checkResources` option.',
};
