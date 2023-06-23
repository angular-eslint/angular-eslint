import { formatFiles, generateFiles, logger } from '@nx/devkit';
import { type Tree } from '@nx/devkit';
import * as path from 'path';
import { type RuleGeneratorSchema } from './schema';

export async function ruleGenerator(tree: Tree, options: RuleGeneratorSchema) {
  const { name, packageName } = options;
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
    `${baseTarget}/tests/rules/${name}`,
    options,
  );

  await formatFiles(tree);

  return () => {
    logger.log(
      `\nSkeleton for new rule generated successfully. See TODO comments for areas to complete.`,
    );
    logger.log(
      `Don't forget to run \`update-rule-docs\` after implementing the rule and its tests!`,
    );
  };
}

export default ruleGenerator;
