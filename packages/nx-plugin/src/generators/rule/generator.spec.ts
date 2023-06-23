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
      name: 'my-new-rule',
      packageName: 'eslint-plugin',
    };

    await ruleGenerator(tree, options);

    expect(
      tree.exists(`packages/eslint-plugin/src/rules/my-new-rule.ts`),
    ).toBeTruthy();
    expect(
      tree.exists(`packages/eslint-plugin/tests/rules/my-new-rule/cases.ts`),
    ).toBeTruthy();
    expect(
      tree.exists(`packages/eslint-plugin/tests/rules/my-new-rule/spec.ts`),
    ).toBeTruthy();
  });

  it('should successfully generate a new rule for package eslint-plugin-template', async () => {
    const options: RuleGeneratorSchema = {
      name: 'my-new-rule',
      packageName: 'eslint-plugin-template',
    };

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
  });
});
