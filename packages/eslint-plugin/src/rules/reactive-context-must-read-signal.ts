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
  },
];
export type MessageIds = 'mustReadSignal';
export const RULE_NAME = 'reactive-context-must-read-signal';

type ReactiveFunction =
  TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

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

function isFunction(node: TSESTree.Node | undefined): node is ReactiveFunction {
  return (
    node?.type === AST_NODE_TYPES.FunctionExpression ||
    node?.type === AST_NODE_TYPES.ArrowFunctionExpression
  );
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
        },
        additionalProperties: false,
      },
    ],
    messages: {
      mustReadSignal:
        '{{primitive}}() must read at least one signal, otherwise it will never re-run when state changes.',
    },
  },
  defaultOptions: [{ checkResources: false }],
  create(context, [{ checkResources = false }]) {
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
     */
    function analyseCallLike(
      callee: TSESTree.Node,
      args: readonly TSESTree.Node[],
      analysis: CallAnalysis,
    ): void {
      let symbol = services.getSymbolAtLocation(callee);
      if (symbol && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
        symbol = checker.getAliasedSymbol(symbol);
      }
      if (
        !symbol ||
        !isDeclaredInDefaultLib(symbol) ||
        args.some(isOpaqueFunctionValue)
      ) {
        analysis.hasUnknown = true;
      }
    }

    /** The analysis of the reactive context we are currently inside, if any. */
    function currentAnalysis(): CallAnalysis | undefined {
      const top = frameStack[frameStack.length - 1];
      return top && analyses.get(top.call);
    }

    function registerTrackedFunction(
      node: TSESTree.Node,
      call: TSESTree.CallExpression,
      analysis: CallAnalysis,
    ): void {
      if (isFunction(node)) {
        trackedFnToCall.set(node, call);
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

      MemberExpression(node: TSESTree.MemberExpression) {
        const analysis = currentAnalysis();
        if (!analysis) {
          return;
        }
        // A getter runs arbitrary code, so `this.name` can read a signal even
        // though it does not look like a call.
        const symbol = services.getSymbolAtLocation(node);
        if (
          symbol &&
          tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.GetAccessor)
        ) {
          analysis.hasUnknown = true;
        }
      },

      ObjectPattern(node: TSESTree.ObjectPattern) {
        const analysis = currentAnalysis();
        if (!analysis) {
          return;
        }
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
            analysis.hasUnknown = true;
          } else if (isGetter(type, property.key.name)) {
            analysis.hasUnknown = true;
          }
        }
      },

      NewExpression(node: TSESTree.NewExpression) {
        const analysis = currentAnalysis();
        if (analysis) {
          analyseCallLike(node.callee, node.arguments, analysis);
        }
      },

      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        const analysis = currentAnalysis();
        if (analysis) {
          analyseCallLike(node.tag, node.quasi.expressions, analysis);
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        // Attribute this call to the tracked function we are currently inside,
        // if any. This runs before registration below, so a reactive context
        // nested inside another tracked function is correctly treated as an
        // (unknown) call of the outer function.
        const analysis = currentAnalysis();
        if (analysis) {
          if (isSignalRead(node.callee)) {
            analysis.hasReactiveRead = true;
          } else {
            analyseCallLike(node.callee, node.arguments, analysis);
          }
        }

        // Register this call if it is one of the reactive contexts.
        if (node.callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        const config = primitives[node.callee.name];
        if (!config) {
          return;
        }

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
    'Reactive contexts like `computed()`, `linkedSignal()`, `effect()` and `afterRenderEffect()` re-run whenever a signal they read changes. If the relevant function never reads a signal, the context runs once and can never react to anything, so it adds overhead without providing reactivity. This is usually a mistake: either the developer forgot to call a signal (e.g. wrote `firstName` instead of `firstName()`), or the value is actually static and should be a plain constant, a `signal()`, or an `afterNextRender()` in the case of `afterRenderEffect()`. To avoid false positives, the rule only reports when everything the tracked function does is known not to read a signal. Calls into the TypeScript standard library (arrays, strings, `Math`, `JSON`, `console`, DOM APIs, etc.) are known to be safe; anything else keeps the rule silent, including a helper function, a service method, a getter, an unresolved symbol, and any Angular API such as `untracked()`. One known limitation: a standard library call that reaches user code through a protocol method, such as `toJSON()` in `JSON.stringify()` or `toString()` in a template literal, is still treated as safe, so a signal read inside such a method is not detected. For `resource()`/`rxResource()` only the `params` function defines the dependencies, and these are opt-in via the `checkResources` option.',
};
