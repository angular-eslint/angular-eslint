import type { Rule, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  determineTargetProjectName,
} from '../utils';

interface Schema {
  project?: string;
  setParserOptionsProject?: boolean;
}

export default function addESLintToProject(schema: Schema): Rule {
  return (tree: Tree) => {
    const projectName = determineTargetProjectName(tree, schema.project);
    if (!projectName) {
      throw new Error(
        '\n' +
          `
Error: You must specify a project to add ESLint to because you have multiple projects in your angular.json

E.g. npx ng g @angular-eslint/schematics:add-eslint-to-project {{YOUR_PROJECT_NAME_GOES_HERE}}
        `.trim(),
      );
    }
    return chain([
      // Create the ESLint config file for the project
      createESLintConfigForProject(
        projectName,
        schema.setParserOptionsProject ?? false,
      ),
      // Set the lint builder and config in angular.json
      addESLintTargetToProject(projectName, 'lint'),
    ]);
  };
}
