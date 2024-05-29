import type { Tree } from '../devkit-imports';
import { convertNxGenerator } from '../devkit-imports';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  determineTargetProjectName,
} from '../utils';

interface Schema {
  project?: string;
  setParserOptionsProject?: boolean;
}

export default convertNxGenerator(async (tree: Tree, options: Schema) => {
  const projectName = determineTargetProjectName(tree, options.project);
  if (!projectName) {
    throw new Error(
      '\n' +
        `
Error: You must specify a project to add ESLint to because you have multiple projects in your angular.json

E.g. npx ng g @angular-eslint/schematics:add-eslint-to-project {{YOUR_PROJECT_NAME_GOES_HERE}}
      `.trim(),
    );
  }

  // Create the config file first so that we can check for its existence when setting the target
  createESLintConfigForProject(
    tree,
    projectName,
    options.setParserOptionsProject ?? false,
  );

  // Update the lint builder and config in angular.json
  addESLintTargetToProject(tree, projectName, 'lint');
});
