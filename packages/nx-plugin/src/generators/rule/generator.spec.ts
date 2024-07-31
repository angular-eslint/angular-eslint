import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { type Tree } from '@nx/devkit';

import { ruleGenerator } from './generator';
import type { RuleGeneratorSchema } from './schema';

describe('rule generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should successfully generate a new rule for package eslint-plugin', async () => {
    const options: RuleGeneratorSchema = {
      ruleName: 'my-new-rule',
      packageName: 'eslint-plugin',
    };
    const packageIndexPath = 'packages/eslint-plugin/src/index.ts';
    const mockIndex = `
      \nexport = {
        configs: {},
        rules: {},
      };
    `;

    tree.write(packageIndexPath, mockIndex);
    await ruleGenerator(tree, options);

    const packageIndexContents = tree
      .read(packageIndexPath)
      ?.toString() as string;

    expect(
      packageIndexContents.includes(
        `import myNewRule, { RULE_NAME as myNewRuleRuleName } from './rules/my-new-rule';`,
      ),
    ).toBeTruthy();
    expect(
      packageIndexContents.includes(`[myNewRuleRuleName]: myNewRule`),
    ).toBeTruthy();

    expect(
      tree.read(`packages/eslint-plugin/src/rules/my-new-rule.ts`)?.toString(),
    ).toMatchSnapshot();
    expect(
      tree
        .read(`packages/eslint-plugin/tests/rules/my-new-rule/cases.ts`)
        ?.toString(),
    ).toMatchSnapshot();
    expect(
      tree
        .read(`packages/eslint-plugin/tests/rules/my-new-rule/spec.ts`)
        ?.toString(),
    ).toMatchSnapshot();
  });

  it('should successfully generate a new rule for package eslint-plugin-template', async () => {
    const options: RuleGeneratorSchema = {
      ruleName: 'my-new-rule',
      packageName: 'eslint-plugin-template',
    };
    const packageIndexPath = 'packages/eslint-plugin-template/src/index.ts';
    const mockIndex = `
      \nexport = {
        configs: {},
        rules: {},
      };
    `;

    tree.write(packageIndexPath, mockIndex);
    await ruleGenerator(tree, options);

    expect(
      tree.exists(`packages/eslint-plugin-template/src/rules/my-new-rule.ts`),
    ).toBeTruthy();
    expect(
      tree.exists(
        `packages/eslint-plugin-template/tests/rules/my-new-rule/cases.ts`,
      ),
    ).toBeTruthy();
    expect(
      tree.exists(
        `packages/eslint-plugin-template/tests/rules/my-new-rule/spec.ts`,
      ),
    ).toBeTruthy();

    const packageIndexContents = tree
      .read(packageIndexPath)
      ?.toString() as string;

    expect(
      packageIndexContents.includes(
        `import myNewRule, { RULE_NAME as myNewRuleRuleName } from './rules/my-new-rule';`,
      ),
    ).toBeTruthy();
    expect(
      packageIndexContents.includes(`[myNewRuleRuleName]: myNewRule`),
    ).toBeTruthy();
  });
});
