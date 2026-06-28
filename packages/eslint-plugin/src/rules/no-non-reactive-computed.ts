import {
  AST_NODE_TYPES,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { KNOWN_SIGNAL_TYPES } from '../utils/signals';

export type Options = [
  {
    readonly checkResources?: boolean;
  },
];
export type MessageIds = 'nonReactivePrimitive';
export const RULE_NAME = 'no-non-reactive-computed';

type ReactiveFunction =
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

interface PrimitiveConfig {
  /** Positional argument indices that hold a tracked reactive function. */
  readonly args: readonly number[];
  /** Option-object keys whose function value is a tracked reactive function. */
  readonly optionKeys: readonly string[];
}

/**
 * Reactive primitives that should depend on at least one signal. The tracked
 * function is the one whose signal reads define the primitive's dependencies:
 * - `computed`/`effect`: the first argument.
 * - `linkedSignal`: the first argument (shorthand) or the `source`/`computation`
 *   functions of the options object.
 */
const DEFAULT_PRIMITIVES: Readonly<Record<string, PrimitiveConfig>> = {
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
  resource: { args: [], optionKeys: ['params', 'request'] },
  rxResource: { args: [], optionKeys: ['params', 'request'] },
};

interface CallAnalysis {
  readonly call: TSESTree.CallExpression;
  readonly primitiveName: string;
  /** Whether the call has at least one tracked function to analyse. */
  hasTrackedFn: boolean;
  /** Whether a reactive (signal) read was seen in any tracked function. */
  hasReactiveRead: boolean;
  /**
   * Whether a call we cannot analyse was seen in any tracked function. Such a
   * call could read a signal internally, so we must not report in that case.
   */
  hasUnknownCall: boolean;
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
        'Ensures that reactive primitives such as computed(), linkedSignal() and effect() read at least one reactive value (a signal). A reactive primitive with no reactive dependencies never re-evaluates, which is almost always a mistake.',
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
      nonReactivePrimitive:
        'This {{primitive}}() does not read any signals, so it will not re-evaluate when state changes. Read a signal inside it, or remove the unnecessary reactivity.',
    },
  },
  defaultOptions: [{ checkResources: false }],
  create(context, [{ checkResources = false }]) {
    const services: ParserServicesWithTypeInformation =
      ESLintUtils.getParserServices(context);

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

    function registerTrackedFunctions(
      call: TSESTree.CallExpression,
      config: PrimitiveConfig,
      analysis: CallAnalysis,
    ): void {
      for (const index of config.args) {
        const arg = call.arguments[index];
        if (isFunction(arg)) {
          trackedFnToCall.set(arg, call);
          analysis.hasTrackedFn = true;
        }
      }

      if (config.optionKeys.length === 0) {
        return;
      }

      for (const arg of call.arguments) {
        if (arg.type !== AST_NODE_TYPES.ObjectExpression) {
          continue;
        }
        for (const property of arg.properties) {
          if (
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier &&
            config.optionKeys.includes(property.key.name) &&
            isFunction(property.value)
          ) {
            trackedFnToCall.set(property.value, call);
            analysis.hasTrackedFn = true;
          }
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

      CallExpression(node: TSESTree.CallExpression) {
        // Attribute this call to the tracked function we are currently inside,
        // if any. This runs before registration below, so a primitive call
        // nested inside another tracked function is correctly treated as an
        // (unknown) call of the outer function.
        const top = frameStack[frameStack.length - 1];
        if (top) {
          const enclosing = analyses.get(top.call);
          if (enclosing) {
            if (isSignalRead(node.callee)) {
              enclosing.hasReactiveRead = true;
            } else {
              enclosing.hasUnknownCall = true;
            }
          }
        }

        // Register this call if it is one of the reactive primitives.
        if (node.callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        const config = primitives[node.callee.name];
        if (!config) {
          return;
        }

        const analysis: CallAnalysis = {
          call: node,
          primitiveName: node.callee.name,
          hasTrackedFn: false,
          hasReactiveRead: false,
          hasUnknownCall: false,
        };
        registerTrackedFunctions(node, config, analysis);
        analyses.set(node, analysis);
      },

      'CallExpression:exit'(node: TSESTree.CallExpression) {
        const analysis = analyses.get(node);
        if (!analysis) {
          return;
        }
        analyses.delete(node);

        // Only report when we are certain there is no reactivity: there is a
        // tracked function, no signal was read, and there was no call that
        // might have read a signal internally.
        if (
          analysis.hasTrackedFn &&
          !analysis.hasReactiveRead &&
          !analysis.hasUnknownCall
        ) {
          context.report({
            node: analysis.call,
            messageId: 'nonReactivePrimitive',
            data: { primitive: analysis.primitiveName },
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Reactive primitives like `computed()`, `linkedSignal()` and `effect()` re-evaluate whenever a signal they read changes. If the relevant function never reads a signal, the primitive runs once and can never react to anything, so it adds overhead without providing reactivity. This is usually a mistake: either the developer forgot to call a signal (e.g. wrote `firstName` instead of `firstName()`), or the value is actually static and should be a plain constant or a `signal()`. To avoid false positives, the rule stays silent whenever the function calls something it cannot analyse (such as a service method), because that function might read a signal internally. For `resource()`/`rxResource()` only the `params` function defines the dependencies, and these are opt-in via the `checkResources` option.',
};
