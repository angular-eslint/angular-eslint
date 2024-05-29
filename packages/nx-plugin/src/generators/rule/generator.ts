import { formatFiles, generateFiles, logger } from '@nx/devkit';
import { type Tree } from '@nx/devkit';
import * as path from 'path';
import { type RuleGeneratorSchema } from './schema';

export async function ruleGenerator(tree: Tree, options: RuleGeneratorSchema) {
  const { ruleName, packageName } = options;
  const ruleNameCamelCase = ruleName.replace(/-./g, (c) => c[1].toUpperCase());
  const baseTarget = `packages/${packageName}`;

  generateFiles(
    tree,
    path.join(__dirname, 'files/src'),
    `${baseTarget}/src`,
    options,
  );
  generateFiles(
    tree,
    path.join(__dirname, 'files/tests'),
    `${baseTarget}/tests/rules/${ruleName}`,
    options,
  );

  // Update package's index.ts to export the new rule
  const packageIndexContents = tree
    .read(`${baseTarget}/src/index.ts`)
    ?.toString() as string;
  const importString = `import ${ruleNameCamelCase}, { RULE_NAME as ${ruleNameCamelCase}RuleName } from './rules/${ruleName}';`;
  let newPackageIndexContents = packageIndexContents.replace(
    '\nexport = {',
    `${importString}\n\nexport = {`,
  );
  newPackageIndexContents = newPackageIndexContents.replace(
    'rules: {',
    `rules: { [${ruleNameCamelCase}RuleName]: ${ruleNameCamelCase},`,
  );
  tree.write(`${baseTarget}/src/index.ts`, newPackageIndexContents);

  await formatFiles(tree);

  return () => {
    logger.log(
      `\nSkeleton for new rule generated successfully. See TODO comments for areas to complete.`,
    );
    logger.log(
      `Don't forget to run \`update-rule-configs\` and \`update-rule-docs\` after implementing the rule and its tests!`,
    );
  };
}

export default ruleGenerator;
