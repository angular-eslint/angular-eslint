import { ASTUtils } from '@angular-eslint/utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'contextualDecorator';
export const RULE_NAME = 'contextual-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that classes use contextual decorators in their body',
    },
    schema: [],
    messages: {
      contextualDecorator:
        'Decorator out of context for "@{{classDecoratorName}}()"',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'MethodDefinition[kind=/^(get|set|method)$/], PropertyDefinition, TSParameterProperty'(
        node:
          | TSESTree.MethodDefinition
          | TSESTree.PropertyDefinition
          | TSESTree.TSParameterProperty,
      ) {
        validateNode(context, node);
      },
    };
  },
});

function validateNode(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  node:
    | TSESTree.MethodDefinition
    | TSESTree.PropertyDefinition
    | TSESTree.TSParameterProperty,
): void {
  if (!node.decorators?.length) {
    return;
  }

  const classDeclaration = ASTUtils.getNearestNodeFrom(
    node,
    ASTUtils.isClassDeclaration,
  );

  if (!classDeclaration) {
    return;
  }

  const classDecoratorName =
    ASTUtils.getAngularClassDecorator(classDeclaration);

  if (!classDecoratorName) {
    return;
  }

  for (const decorator of node.decorators) {
    validateDecorator(context, decorator, classDecoratorName);
  }
}

function validateDecorator(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  decorator: TSESTree.Decorator,
  classDecoratorName: ASTUtils.AngularClassDecoratorKeys,
): void {
  const decoratorName = ASTUtils.getDecoratorName(decorator);

  if (!decoratorName || !ASTUtils.isAngularInnerClassDecorator(decoratorName)) {
    return;
  }

  const allowedDecorators =
    ASTUtils.ANGULAR_CLASS_DECORATOR_MAPPER.get(classDecoratorName);

  if (allowedDecorators?.has(decoratorName)) {
    return;
  }

  context.report({
    node: decorator,
    messageId: 'contextualDecorator',
    data: { classDecoratorName },
  });
}

export const RULE_DOCS_EXTENSION = {
  rationale: `Angular decorators like @Input(), @Output(), @ViewChild(), and @HostBinding() are only meaningful in specific class types. For example, @Input() and @Output() only work in @Component or @Directive classes because they define the component/directive's API. Using these decorators in @Injectable() classes or @Pipe() classes will not work as expected, as Angular does not process these decorators in those contexts. This rule prevents bugs by ensuring decorators are only used where Angular will recognize and process them.`,
};
