// @ts-check

module.exports = {
  rules: {
    'require-rule-docs-extension': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ensure RULE_DOCS_EXTENSION is exported with rationale',
        },
      },
      create(/** @type {import('eslint').Rule.RuleContext} */ context) {
        return {
          Program(
            /** @type {import('@typescript-eslint/utils').TSESTree.Program} */ node,
          ) {
            const allExports = node.body.filter(
              (s) => s.type === 'ExportNamedDeclaration',
            );
            const ruleDocsExport = allExports.find((s) => {
              if (!s.declaration) return false;
              const decl = s.declaration;
              if (
                decl.type === 'VariableDeclaration' &&
                decl.declarations.length === 1
              ) {
                const id = decl.declarations[0].id;
                return (
                  id.type === 'Identifier' && id.name === 'RULE_DOCS_EXTENSION'
                );
              }
              return false;
            });

            if (!ruleDocsExport) {
              context.report({
                loc: { line: 1, column: 0 },
                message:
                  'Each rule file must export a named constant `RULE_DOCS_EXTENSION`.',
              });
              return;
            }

            // Ensure it’s initialized to an object with `rationale: string`
            if (
              ruleDocsExport.declaration?.type !== 'VariableDeclaration' ||
              ruleDocsExport.declaration?.declarations.length !== 1 ||
              ruleDocsExport.declaration?.declarations[0].id.type !==
                'Identifier' ||
              ruleDocsExport.declaration?.declarations[0].id.name !==
                'RULE_DOCS_EXTENSION' ||
              ruleDocsExport.declaration?.declarations[0]?.init?.type !==
                'ObjectExpression' ||
              ruleDocsExport.declaration?.declarations[0]?.init?.properties?.some(
                (p) =>
                  p.type !== 'Property' ||
                  p.key?.type !== 'Identifier' ||
                  p.key?.name !== 'rationale' ||
                  // String literal
                  ((p.value?.type !== 'Literal' ||
                    typeof p.value?.value !== 'string' ||
                    // Make sure the string is not empty
                    (typeof p.value?.value === 'string' &&
                      p.value?.value?.trim() === '')) &&
                    // Template literal
                    !(
                      p.value?.type === 'TemplateLiteral' &&
                      p.value?.quasis?.every(
                        (q) =>
                          // Make sure the template literal is not empty
                          q.value?.raw?.trim() !== '',
                      )
                    )),
              )
            ) {
              context.report({
                loc: ruleDocsExport.loc,
                message:
                  '`RULE_DOCS_EXTENSION` must be an object with a string property `rationale`.',
              });
              return;
            }
          },
        };
      },
    },
  },
};
