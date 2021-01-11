import { TSESTree } from '@typescript-eslint/experimental-utils';
// TODO: Refactor this import once https://github.com/typescript-eslint/typescript-eslint/issues/2931 is fixed.
import { RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import { getDeclaredInterfaceName, isImportDeclaration } from '../utils/utils';

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
      description: `Ensures that Pipes implement \`${PIPE_TRANSFORM}\` interface`,
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      usePipeTransformInterface: `Pipes should implement \`${PIPE_TRANSFORM}\` interface`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [PIPE_CLASS_DECORATOR]({
        parent: classDeclaration,
      }: TSESTree.Decorator & { parent: TSESTree.ClassDeclaration }) {
        if (getDeclaredInterfaceName(classDeclaration, PIPE_TRANSFORM)) return;

        const {
          errorNode,
          implementsNodeReplace,
          implementsTextReplace,
        } = getErrorSchemaOptions(classDeclaration);

        context.report({
          node: errorNode,
          messageId: 'usePipeTransformInterface',
          fix: (fixer) => [
            getImportFix(classDeclaration, fixer),
            fixer.insertTextAfter(implementsNodeReplace, implementsTextReplace),
          ],
        });
      },
    };
  },
});

function getErrorSchemaOptions(classDeclaration: TSESTree.ClassDeclaration) {
  const classDeclarationIdentifier = classDeclaration.id as TSESTree.Identifier;
  const [
    errorNode,
    implementsNodeReplace,
    implementsTextReplace,
  ] = classDeclaration.implements
    ? [
        classDeclarationIdentifier,
        classDeclaration.implements[classDeclaration.implements.length - 1],
        `, ${PIPE_TRANSFORM}`,
      ]
    : [
        classDeclarationIdentifier,
        classDeclarationIdentifier,
        ` implements ${PIPE_TRANSFORM}`,
      ];

  return { errorNode, implementsNodeReplace, implementsTextReplace } as const;
}

function getImportDeclaration(
  node: TSESTree.ClassDeclaration,
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

function getImportFix(node: TSESTree.ClassDeclaration, fixer: RuleFixer) {
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
