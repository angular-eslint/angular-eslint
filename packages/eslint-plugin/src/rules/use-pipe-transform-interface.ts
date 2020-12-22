import { TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { createESLintRule } from '../utils/create-eslint-rule';
import { isClassDeclaration, isImportDeclaration } from '../utils/utils';

type Options = [];
export type MessageIds = 'usePipeTransformInterface';
export const RULE_NAME = 'use-pipe-transform-interface';
const PIPE_TRANSFORM = 'PipeTransform';
const ANGULAR_CORE_MODULE_PATH = '@angular/core';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that Pipes implement ${PIPE_TRANSFORM} interface`,
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      usePipeTransformInterface: `Pipes should implement ${PIPE_TRANSFORM} interface`,
    },
  },
  defaultOptions: [],
  create(context) {
    const selector = `ClassDeclaration[implements=undefined], ClassDeclaration > :matches(TSClassImplements:not([expression.name="${PIPE_TRANSFORM}"], [expression.property.name="${PIPE_TRANSFORM}"]))`;

    return {
      [selector](node: TSESTree.ClassDeclaration | TSESTree.TSClassImplements) {
        const {
          errorNode,
          implementsNodeReplace,
          implementsTextReplace,
        } = getErrorSchemaOptions(node);

        context.report({
          node: errorNode,
          messageId: 'usePipeTransformInterface',
          fix: (fixer) => [
            getImportFix(node, fixer),
            fixer.insertTextAfter(implementsNodeReplace, implementsTextReplace),
          ],
        });
      },
    };
  },
});

function getErrorSchemaOptions(
  node: TSESTree.ClassDeclaration | TSESTree.TSClassImplements,
) {
  const [
    errorNode,
    implementsNodeReplace,
    implementsTextReplace,
  ] = isClassDeclaration(node)
    ? [node.id!, node.id!, ` implements ${PIPE_TRANSFORM}`]
    : [
        (node.parent as TSESTree.ClassDeclaration).id!,
        node,
        `, ${PIPE_TRANSFORM}`,
      ];

  return { errorNode, implementsNodeReplace, implementsTextReplace } as const;
}

function getImportDeclaration(
  node: TSESTree.ClassDeclaration | TSESTree.TSClassImplements,
  module: string,
): TSESTree.ImportDeclaration | undefined {
  let parentNode: TSESTree.Node | undefined = node;

  while ((parentNode = parentNode.parent)) {
    if (parentNode.type !== 'Program') continue;

    return parentNode.body.find(
      (node) => isImportDeclaration(node) && node.source.value === module,
    ) as TSESTree.ImportDeclaration | undefined;
  }

  return parentNode;
}

function getImportFix(
  node: TSESTree.ClassDeclaration | TSESTree.TSClassImplements,
  fixer: RuleFixer,
) {
  const importDeclaration = getImportDeclaration(
    node,
    ANGULAR_CORE_MODULE_PATH,
  );

  if (!importDeclaration?.specifiers.length) {
    return fixer.insertTextAfterRange(
      [0, 0],
      `import { ${PIPE_TRANSFORM} } from '${ANGULAR_CORE_MODULE_PATH}';\n`,
    );
  }

  const lastImportSpecifier = importDeclaration.specifiers.slice(-1)[0];

  return fixer.insertTextAfter(lastImportSpecifier, `, ${PIPE_TRANSFORM}`);
}
