import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [
  {
    maxComplexity: number;
  },
];
export type MessageIds = 'cyclomaticComplexity';
export const RULE_NAME = 'cyclomatic-complexity';

const BOUND_ATTRIBUTE_NAMES = ['ngForOf', 'ngIf', 'ngSwitchCase'];
const TEXT_ATTRIBUTE_NAMES = ['ngSwitchDefault'];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code`,
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          maxComplexity: {
            type: 'number',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      cyclomaticComplexity:
        'The cyclomatic complexity exceeded the defined limit of {{maxComplexity}}. Your template should be refactored.',
    },
  },
  defaultOptions: [
    {
      maxComplexity: 5,
    },
  ],
  create(context: any, [options]) {
    let totalComplexity = 0;

    const parserServices = getTemplateParserServices(context);
    const { maxComplexity } = options;

    const validateCyclomaticComplexity = (node: any) => {
      totalComplexity += 1;

      if (totalComplexity <= maxComplexity) {
        return;
      }

      const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

      context.report({
        messageId: 'cyclomaticComplexity',
        loc,
        data: {
          maxComplexity,
        },
      });
    };

    return parserServices.defineTemplateBodyVisitor({
      BoundAttribute(node: any) {
        if (!BOUND_ATTRIBUTE_NAMES.includes(node.name)) {
          return;
        }

        validateCyclomaticComplexity(node);
      },
      TextAttribute(node: any) {
        if (!TEXT_ATTRIBUTE_NAMES.includes(node.name)) {
          return;
        }

        validateCyclomaticComplexity(node);
      },
    });
  },
});
