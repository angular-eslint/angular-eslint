import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import type { Linter } from 'eslint';
import { updateJsonInTree, visitNotIgnoredFiles } from '../../utils';
import { updateDependencies } from '../utils/dependencies';

const updatedAngularESLintVersion = '^12.0.0';
const updatedTypeScriptESLintVersion = '4.28.2';
const updatedESLintVersion = '7.26.0';

function migrateToAccessibilityLabelHasAssociatedControlSchema(
  rule: Linter.RuleEntry | undefined,
) {
  if (!Array.isArray(rule) || rule.length !== 2) return;
  const [, currentSchema] = rule;
  rule[1] = {
    controlComponents: currentSchema.controlComponents,
    labelComponents: currentSchema.labelComponents.map((selector: string) => {
      return { inputs: currentSchema.labelAttributes, selector };
    }),
  };
}

function migrateFromAccessibilityLabelFor({ overrides, rules }: Linter.Config) {
  migrateToAccessibilityLabelHasAssociatedControlSchema(
    rules?.['@angular-eslint/template/accessibility-label-for'],
  );
  migrateToAccessibilityLabelHasAssociatedControlName(rules);
  for (const override of overrides ?? []) {
    migrateToAccessibilityLabelHasAssociatedControlSchema(
      override.rules?.['@angular-eslint/template/accessibility-label-for'],
    );
    migrateToAccessibilityLabelHasAssociatedControlName(override.rules);
  }
}

function migrateToAccessibilityLabelHasAssociatedControlName(
  rules: Partial<Linter.RulesRecord> | undefined,
) {
  if (!rules) return;
  const accessibilityLabelForRule =
    rules['@angular-eslint/template/accessibility-label-for'];
  delete rules['@angular-eslint/template/accessibility-label-for'];
  rules['@angular-eslint/template/accessibility-label-has-associated-control'] =
    accessibilityLabelForRule;
}

function updateAccessibilityLabelFor() {
  return chain([
    visitNotIgnoredFiles((filePath) => {
      if (!filePath.endsWith('.eslintrc.json')) {
        return;
      }
      return updateJsonInTree(filePath.toString(), (json) => {
        migrateFromAccessibilityLabelFor(json);
        return json;
      });
    }),
  ]);
}

function addEqeqeqIfNeeded(rules: Partial<Linter.RulesRecord> | undefined) {
  if (
    !rules ||
    !rules['@angular-eslint/template/no-negated-async'] ||
    rules['@angular-eslint/template/eqeqeq']
  ) {
    return;
  }

  rules['@angular-eslint/template/eqeqeq'] = 'error';
}

function addEqeqeq() {
  return chain([
    visitNotIgnoredFiles((filePath) => {
      if (!filePath.endsWith('.eslintrc.json')) {
        return;
      }
      return updateJsonInTree(filePath.toString(), (json) => {
        addEqeqeqIfNeeded(json.rules);
        (json.overrides ?? []).forEach((override: Linter.ConfigOverride) =>
          addEqeqeqIfNeeded(override.rules),
        );
        return json;
      });
    }),
  ]);
}

export default function migration(): Rule {
  return chain([
    updateDependencies([
      {
        packageName: '@angular-eslint/builder',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@angular-eslint/eslint-plugin',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@angular-eslint/eslint-plugin-template',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@angular-eslint/template-parser',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@typescript-eslint/eslint-plugin',
        version: updatedTypeScriptESLintVersion,
      },
      {
        packageName: '@typescript-eslint/experimental-utils',
        version: updatedTypeScriptESLintVersion,
      },
      {
        packageName: '@typescript-eslint/parser',
        version: updatedTypeScriptESLintVersion,
      },
      {
        packageName: 'eslint',
        version: `^${updatedESLintVersion}`,
      },
    ]),
    updateAccessibilityLabelFor,
    addEqeqeq,
  ]);
}
