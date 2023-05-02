import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateJsonInTree, visitNotIgnoredFiles } from '../../utils';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '5.59.2';
const updatedESLintVersion = '8.39.0';

export default function migration(): Rule {
  return chain([
    updateDependencies([
      {
        packageName: '@typescript-eslint/eslint-plugin',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: '@typescript-eslint/utils',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: '@typescript-eslint/parser',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: 'eslint',
        version: `^${updatedESLintVersion}`,
      },
    ]),
    updateA11yRules,
  ]);
}

// Remove the accessibility- prefix from all relevant template rules
function updateA11yRules() {
  function modifyRules(parent: { rules?: Record<string, unknown> }) {
    if (!parent.rules) {
      return;
    }
    for (const rule of Object.keys(parent.rules)) {
      if (rule.startsWith('@angular-eslint/template/accessibility-')) {
        const ruleConfig = parent.rules[rule];
        parent.rules[rule.replace('accessibility-', '')] = ruleConfig;
        delete parent.rules[rule];
      }
    }
  }

  return chain([
    visitNotIgnoredFiles((filePath) => {
      if (!filePath.endsWith('.eslintrc.json')) {
        return;
      }
      return updateJsonInTree(filePath.toString(), (json) => {
        if (json.overrides) {
          for (const override of json.overrides) {
            modifyRules(override);
          }
        }
        modifyRules(json);
        return json;
      });
    }),
  ]);
}
