import type { Tree } from '@nx/devkit';
import { convertNxGenerator } from '@nx/devkit';
import {
  addESLintTargetToProject__NX,
  createESLintConfigForProject__NX,
  determineTargetProjectName__NX,
} from '../utils';

interface Schema {
  project?: string;
  setParserOptionsProject?: boolean;
}

export default convertNxGenerator(async (tree: Tree, options: Schema) => {
  const projectName = determineTargetProjectName__NX(tree, options.project);
  if (!projectName) {
    throw new Error(
      '\n' +
        `
Error: You must specify a project to add ESLint to because you have multiple projects in your angular.json

E.g. npx ng g @angular-eslint/schematics:add-eslint-to-project {{YOUR_PROJECT_NAME_GOES_HERE}}
      `.trim(),
    );
  }

  // Update the lint builder and config in angular.json
  addESLintTargetToProject__NX(tree, projectName, 'lint');

  createESLintConfigForProject__NX(
    tree,
    projectName,
    options.setParserOptionsProject ?? false,
  );
});
