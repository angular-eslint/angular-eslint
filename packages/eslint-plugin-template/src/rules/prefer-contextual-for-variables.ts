import {
  AST,
  ASTWithSource,
  Binary,
  Conditional,
  ImplicitReceiver,
  LiteralPrimitive,
  PrefixNot,
  PropertyRead,
  TmplAstIfBlockBranch,
  type TmplAstForLoopBlock,
  type TmplAstVariable,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { TSESTree } from '@typescript-eslint/utils';
import { SourceCode } from '@typescript-eslint/utils/ts-eslint';
import { areEquivalentASTs } from '../utils/are-equivalent-asts';
import { createESLintRule } from '../utils/create-eslint-rule';
import { unwrapParenthesizedExpression } from '../utils/unwrap-parenthesized-expression';

export type Options = [
  {
    readonly allowedAliases?: {
      $count?: readonly string[];
      $index?: readonly string[];
      $first?: readonly string[];
      $last?: readonly string[];
      $even?: readonly string[];
      $odd?: readonly string[];
    };
  },
];
export type MessageIds =
  | 'preferContextualVariable'
  | 'preferCount'
  | 'preferFirst'
  | 'preferLast'
  | 'preferEven'
  | 'preferOdd';
export const RULE_NAME = 'prefer-contextual-for-variables';
const DEFAULT_OPTIONS: Options[number] = {
  allowedAliases: {
    $count: [],
    $index: [],
    $first: [],
    $last: [],
    $even: [],
    $odd: [],
  },
};
const EQUALITY_OPERATORS = ['===', '=='];
const INEQUALITY_OPERATORS = ['!==', '!='];
const LOGICAL_OPERATORS = ['&&', '||'];
export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that contextual variables are used in @for blocks where possible instead of aliasing them.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowedAliases: {
            type: 'object',
            properties: {
              $count: {
                type: 'array',
                items: { type: 'string' },
                description: 'Aliases for $count that are allowed to be used.',
              },
              $index: {
                type: 'array',
                items: { type: 'string' },
                description: 'Aliases for $index that are allowed to be used.',
              },
              $first: {
                type: 'array',
                items: { type: 'string' },
                description: 'Aliases for $first that are allowed to be used.',
              },
              $last: {
                type: 'array',
                items: { type: 'string' },
                description: 'Aliases for $last that are allowed to be used.',
              },
              $even: {
                type: 'array',
                items: { type: 'string' },
                description: 'Aliases for $even that are allowed to be used.',
              },
              $odd: {
                type: 'array',
                items: { type: 'string' },
                description: 'Aliases for $odd that are allowed to be used.',
              },
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferContextualVariable:
        "Use the '{{name}}' contextual variable instead of aliasing it.",
      preferCount: "Use '$count' instead of '{{ expression }}'.",
      preferFirst: "Use '$first' instead of '{{ expression }}'.",
      preferLast: "Use '$last' instead of '{{ expression }}'.",
      preferEven: "Use '$even' instead of '{{ expression }}'.",
      preferOdd: "Use '$odd' instead of '{{ expression }}'.",
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowedAliases }]) {
    const parserServices = getTemplateParserServices(context);
    const forLoops: ForLoopInfo[] = [];

    function reportSimplifications(
      messageId: SimplificationMessageIds,
      forLoop: ForLoopInfo,
    ): void {
      const simplifications = forLoop.simplifications?.[messageId];
      if (!simplifications) {
        return;
      }
      const sourceCode = context.sourceCode;
      for (const simplification of simplifications) {
        context.report({
          messageId,
          loc: {
            start: sourceCode.getLocFromIndex(simplification.range[0]),
            end: sourceCode.getLocFromIndex(simplification.range[1]),
          },
          data: {
            expression: context.sourceCode.text.slice(
              simplification.range[0],
              simplification.range[1],
            ),
          },
          fix: (fixer) =>
            fixer.replaceTextRange(
              simplification.range,
              simplification.replacement,
            ),
        });
      }
    }

    return {
      ForLoopBlock(node: TmplAstForLoopBlock) {
        // We need to know if there are nested for loops before we
        // can report any problems. When there are nested for loops,
        // aliasing will be required to access the outer contextual
        // variables from within the inner loop, so we won't report
        // any problems when there are nested for loops.
        const nested = forLoops.length > 0;
        if (nested) {
          forLoops[forLoops.length - 1].canAlias = true;
        }

        // All contextual variables are defined, but
        // only aliased variables have a value span.
        const variables = node.contextVariables.filter((x) => x.valueSpan);
        forLoops.push({
          canAlias: nested,
          source: node.expression.ast,
          variables,
          references:
            // Don't bother creating a map of variable
            // references if there are no variables to track.
            variables.length > 0
              ? new Map(variables.map((variable) => [variable.name, []]))
              : undefined,
        });
      },
      'ForLoopBlock:exit'() {
        const forLoop = forLoops.pop();
        if (!forLoop) {
          return;
        }

        if (!forLoop.canAlias) {
          const problems: Problem[] = [];
          for (const [index, variable] of forLoop.variables.entries()) {
            const allowed = getAllowedAliases(allowedAliases, variable.value);
            if (allowed === undefined || !allowed.includes(variable.name)) {
              problems.push({
                index,
                variable,
                loc: parserServices.convertNodeSourceSpanToLoc(
                  variable.sourceSpan,
                ),
              });
            }
          }

          for (const problem of problems) {
            context.report({
              messageId: 'preferContextualVariable',
              loc: problem.loc,
              data: { name: problem.variable.value },
              fix: function* (fixer) {
                yield fixer.removeRange(
                  getVariableRangeToRemove(
                    problem,
                    context.sourceCode,
                    forLoop.variables.length,
                  ),
                );

                // Replace any references to the alias
                // with the contextual variable name.
                const references = forLoop.references?.get(
                  problem.variable.name,
                );
                if (references) {
                  for (const reference of references) {
                    yield fixer.replaceTextRange(
                      reference,
                      problem.variable.value,
                    );
                  }
                }
              },
            });
          }
        }

        if (forLoop.simplifications) {
          reportSimplifications('preferCount', forLoop);
          reportSimplifications('preferFirst', forLoop);
          reportSimplifications('preferLast', forLoop);
          reportSimplifications('preferEven', forLoop);
          reportSimplifications('preferOdd', forLoop);
        }
      },
      PropertyRead(node: PropertyRead) {
        // Get the information for the inner-most for loop (which will be
        // the last one in the array) so that we can record the usage of
        // aliases and expressions using contextual variables that can be
        // simplified. We only need the inner-most for loop because we
        // don't remove aliases when there are nested for loops (meaning
        // we don't need to record alias usage for the outer for loop), and
        // any contextual variables will only reference the inner most loop.
        const forLoop = forLoops.at(-1);
        if (!forLoop) {
          return;
        }

        // Record any references to aliased variables so
        // that we can replace them if we remove the alias.
        forLoop.references
          ?.get(node.name)
          ?.push([node.sourceSpan.start, node.sourceSpan.end]);

        // If the `length` property is being read from the same
        // value that was used as the source of the for loop, then
        // we can simplify that to just use the `$count` variable.
        if (
          node.name === 'length' &&
          areEquivalentASTs(node.receiver, forLoop.source)
        ) {
          recordSimplification(node, forLoop, 'preferCount', '$count');
        }
      },
      Binary(node: Binary) {
        const forLoop = forLoops.at(-1);
        if (!forLoop) {
          return;
        }

        if (isIndex(node.left)) {
          if (isZero(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `$index === 0` can be simplified to `$first`.
              recordSimplification(node, forLoop, 'preferFirst', '$first');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '>'
            ) {
              // `$index !== 0` or `$index > 0` can be simplified to `!$first`.
              recordSimplification(node, forLoop, 'preferFirst', '!$first');
            }
          } else if (isCountMinusOne(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `$index === ($count - 1)` can be simplified to `$last`.
              recordSimplification(node, forLoop, 'preferLast', '$last');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '<'
            ) {
              // `$index !== ($count - 1)` or `$index < ($count - 1)`
              // can be simplified to `!$last`.
              recordSimplification(node, forLoop, 'preferLast', '!$last');
            }
          }
        } else if (isZero(node.left)) {
          if (isIndex(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `0 === $index` can be simplified to `$first`.
              recordSimplification(node, forLoop, 'preferFirst', '$first');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '<'
            ) {
              // `0 !== $index` or `0 < $index` can be simplified to `!$first`.
              recordSimplification(node, forLoop, 'preferFirst', '!$first');
            }
          } else if (isIndexModTwo(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `0 == ($index % 2)` can be simplified to `$even`.
              recordSimplification(node, forLoop, 'preferEven', '$even');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '<'
            ) {
              // `0 !== ($index % 2)` or `0 < ($index % 2)`
              // can be simplified to `$odd`.
              recordSimplification(node, forLoop, 'preferOdd', '$odd');
            }
          }
        } else if (isOne(node.left)) {
          if (isIndexModTwo(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `1 === ($index % 2)` can be simplified to `$odd`.
              recordSimplification(node, forLoop, 'preferOdd', '$odd');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '>'
            ) {
              // `1 !== ($index % 2)` or `1 > ($index % 2)`
              // can be simplified to `$even`.
              recordSimplification(node, forLoop, 'preferEven', '$even');
            }
          }
        } else if (isCount(node.left)) {
          if (isIndexPlusOne(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `$count === ($index + 1)` can be simplified to `$last`.
              recordSimplification(node, forLoop, 'preferLast', '$last');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '>'
            ) {
              // `$count !== ($index + 1)` or `$count > ($index + 1)`
              // can be simplified to `!$last`.
              recordSimplification(node, forLoop, 'preferLast', '!$last');
            }
          }
        } else if (isIndexPlusOne(node.left)) {
          if (isCount(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `($index + 1) === $count` can be simplified to `$last`.
              recordSimplification(node, forLoop, 'preferLast', '$last');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '<'
            ) {
              // `($index + 1) !== $count` or `($index + 1) < $count`
              // can be simplified to `!$last`.
              recordSimplification(node, forLoop, 'preferLast', '!$last');
            }
          }
        } else if (isCountMinusOne(node.left)) {
          if (isIndex(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `($count - 1) === $index` can be simplified to `$last`.
              recordSimplification(node, forLoop, 'preferLast', '$last');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '>'
            ) {
              // `($count - 1) !== $index` or `($count - 1) > $index`
              // can be simplified to `!$last`.
              recordSimplification(node, forLoop, 'preferLast', '!$last');
            }
          }
        } else if (isIndexModTwo(node.left)) {
          if (isZero(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `($index % 2) === 0` can be simplified to `$even`.
              recordSimplification(node, forLoop, 'preferEven', '$even');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '>'
            ) {
              // `($index % 2) !== 0` or `($index % 2) > 0`
              // can be simplified to `$odd`.
              recordSimplification(node, forLoop, 'preferOdd', '$odd');
            }
          } else if (isOne(node.right)) {
            if (EQUALITY_OPERATORS.includes(node.operation)) {
              // `($index % 2) === 1` can be simplified to `$odd`.
              recordSimplification(node, forLoop, 'preferOdd', '$odd');
            } else if (
              INEQUALITY_OPERATORS.includes(node.operation) ||
              node.operation === '<'
            ) {
              // `($index % 2) !== 1` or `($index % 2) < 1`
              // can be simplified to `$even`.
              recordSimplification(node, forLoop, 'preferEven', '$even');
            }
          } else if (LOGICAL_OPERATORS.includes(node.operation)) {
            // `$index % 2` can be used to test if `$index` is odd, but it
            // results in a number, so we can only simplify it when it is
            // being used as a truthy value. Because it's on the left-hand
            // side of a logical binary expression, we can simplify it.
            recordSimplification(node.left, forLoop, 'preferOdd', '$odd');
          }
        }

        if (
          isIndexModTwo(node.right) &&
          LOGICAL_OPERATORS.includes(node.operation)
        ) {
          // As we did with the left-hand side above, when `$index % 2`
          // is used as a truthy value on the right-hand side
          // of a logical binary expression, we can simplify it.
          recordSimplification(node.right, forLoop, 'preferOdd', '$odd');
        }
      },
      PrefixNot(node: PrefixNot) {
        const forLoop = forLoops.at(-1);
        if (!forLoop) {
          return;
        }

        if (isOdd(node.expression) || isIndexModTwo(node.expression)) {
          // `!$odd` or `!($index % 2)` can be simplified to `$even`.
          recordSimplification(node, forLoop, 'preferEven', '$even');
        } else if (isEven(node.expression)) {
          // `!$even` can be simplified to `$odd`.
          recordSimplification(node, forLoop, 'preferOdd', '$odd');
        }
      },
      Conditional(node: Conditional) {
        const forLoop = forLoops.at(-1);
        if (!forLoop) {
          return;
        }

        // If the condition is `$index % 2`, then it's being
        // used as a truthy value and we can simplify it.
        if (isIndexModTwo(node.condition)) {
          recordSimplification(node.condition, forLoop, 'preferOdd', '$odd');
        }
      },
      IfBlockBranch(node: TmplAstIfBlockBranch) {
        const forLoop = forLoops.at(-1);
        if (!forLoop) {
          return;
        }

        // If the expression is `$index % 2`, then it's being
        // used as a truthy value and we can simplify it.
        if (node.expression) {
          let expression = node.expression;
          if (expression instanceof ASTWithSource) {
            expression = expression.ast;
          }
          if (isIndexModTwo(expression)) {
            recordSimplification(expression, forLoop, 'preferOdd', '$odd');
          }
        }
      },
    };
  },
});

function getAllowedAliases(
  allowedAliases: Options[number]['allowedAliases'],
  variableName: string,
): readonly string[] | undefined {
  if (allowedAliases && variableName in allowedAliases) {
    return allowedAliases[variableName as keyof typeof allowedAliases];
  }
  return undefined;
}

function getVariableRangeToRemove(
  problem: Problem,
  sourceCode: SourceCode,
  variableCount: number,
): TSESTree.Range {
  let start = problem.variable.sourceSpan.start.offset;
  let end = problem.variable.sourceSpan.end.offset;
  if (variableCount === 1) {
    // There's only one variable defined, so we
    // want to remove the `let` keyword as well.
    const letIndex = getStartOfPreviousToken('let', start, sourceCode);
    if (letIndex !== undefined) {
      // We also want to remove the preceding semicolon.
      start = getStartOfPreviousToken(';', letIndex, sourceCode) ?? letIndex;
    }
  } else if (problem.index === 0) {
    // There are multiple variables, but we're removing
    // the first one. We need to keep the `let` keyword, but
    // remove the trailing comma and any whitespace after it.
    const commaIndex = getStartOfNextToken(',', end, sourceCode);
    if (commaIndex !== undefined) {
      // The range to remove is end-exclusive, so we
      // need to add one to remove the comma.
      end = getIndexOfNextNonWhitespace(commaIndex + 1, sourceCode);
    }
  } else {
    // There is a variable before this one, so we
    // need to remove the preceding comma as well.
    start = getStartOfPreviousToken(',', start, sourceCode) ?? start;
  }

  return [start, end];
}

function getStartOfPreviousToken(
  tokenToFind: string,
  startIndex: number,
  sourceCode: SourceCode,
): number | undefined {
  const text = sourceCode.text;
  for (let i = startIndex - tokenToFind.length; i >= 0; i--) {
    if (text.slice(i, i + tokenToFind.length) === tokenToFind) {
      return i;
    }
  }
  return undefined;
}

function getStartOfNextToken(
  tokenToFind: string,
  startIndex: number,
  sourceCode: SourceCode,
): number | undefined {
  const text = sourceCode.text;
  for (let i = startIndex; i < text.length; i++) {
    if (text.slice(i, i + tokenToFind.length) === tokenToFind) {
      return i;
    }
  }
  return undefined;
}

function getIndexOfNextNonWhitespace(
  startIndex: number,
  sourceCode: SourceCode,
): number {
  const text = sourceCode.text;
  let index = startIndex;
  while (index < text.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!/\s/.test(text.at(index)!)) {
      return index;
    }
    index++;
  }
  return text.length;
}

function recordSimplification(
  node: AST,
  forLoop: ForLoopInfo,
  type: keyof Simplifications,
  replacement: string,
) {
  // Most of the time we won't find anything to simplify because
  // we would have simplified everything on the previous passes,
  // so we delay-create this to reduce memory allocations.
  if (!forLoop.simplifications) {
    forLoop.simplifications = {};
  }

  let nodes = forLoop.simplifications[type];
  if (!nodes) {
    nodes = [];
    forLoop.simplifications[type] = nodes;
  }
  nodes.push({
    range: [node.sourceSpan.start, node.sourceSpan.end],
    replacement,
  });
}

function isIndex(node: AST): boolean {
  return isContextualVariable(node, '$index');
}

function isIndexPlusOne(node: AST): boolean {
  const unwrapped = unwrapParenthesizedExpression(node);
  if (unwrapped instanceof Binary) {
    if (unwrapped.operation === '+') {
      if (isIndex(unwrapped.left)) {
        return isOne(unwrapped.right);
      } else {
        return isIndex(unwrapped.right) && isOne(unwrapped.left);
      }
    }
  }

  return false;
}

function isIndexModTwo(node: AST): boolean {
  const unwrapped = unwrapParenthesizedExpression(node);
  return (
    unwrapped instanceof Binary &&
    unwrapped.operation === '%' &&
    isIndex(unwrapped.left) &&
    isTwo(unwrapped.right)
  );
}

function isCount(node: AST): boolean {
  return isContextualVariable(node, '$count');
}

function isCountMinusOne(node: AST): boolean {
  const unwrapped = unwrapParenthesizedExpression(node);
  if (unwrapped instanceof Binary) {
    if (unwrapped.operation === '-') {
      if (isCount(unwrapped.left)) {
        return isOne(unwrapped.right);
      } else {
        return isCount(unwrapped.right) && isOne(unwrapped.left);
      }
    }
  }

  return false;
}

function isEven(node: AST): boolean {
  return isContextualVariable(node, '$even');
}

function isOdd(node: AST): boolean {
  return isContextualVariable(node, '$odd');
}

function isContextualVariable(
  node: AST,
  name: '$index' | '$count' | '$first' | '$last' | '$even' | '$odd',
) {
  return (
    node instanceof PropertyRead &&
    node.name === name &&
    // The contextual variable must be accessed implicitly.
    // That is, `this.$index` is not a contextual variable.
    // Note that `ThisReceiver` extends `ImplicitReceiver`, so we
    // need to check that the receiver is exactly an `ImplicitReceiver`
    // and not just an instance of `ImplicitReceiver`.
    node.receiver.constructor === ImplicitReceiver
  );
}

function isZero(node: AST): boolean {
  return isLiteralNumber(node, 0);
}

function isOne(node: AST): boolean {
  return isLiteralNumber(node, 1);
}

function isTwo(node: AST): boolean {
  return isLiteralNumber(node, 2);
}

function isLiteralNumber(node: AST, value: number): boolean {
  return node instanceof LiteralPrimitive && node.value === value;
}

interface ForLoopInfo {
  canAlias: boolean;
  readonly source: AST;
  readonly variables: readonly TmplAstVariable[];
  readonly references: Map<string, TSESTree.Range[]> | undefined;
  simplifications?:
    | Partial<Record<SimplificationMessageIds, Simplification[]>>
    | undefined;
}

interface Simplifications {
  preferCount?: Simplification[];
  preferFirst?: Simplification[];
  preferLast?: Simplification[];
  preferEven?: Simplification[];
  preferOdd?: Simplification[];
}

interface Simplification {
  readonly range: TSESTree.Range;
  readonly replacement: string;
}

interface Problem {
  readonly index: number;
  readonly variable: TmplAstVariable;
  readonly loc: TSESTree.SourceLocation;
}

type SimplificationMessageIds = Exclude<MessageIds, 'preferContextualVariable'>;
