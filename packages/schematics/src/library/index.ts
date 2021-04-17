import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, externalSchematic } from '@angular-devkit/schematics';
/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema } from '@schematics/angular/library/schema';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  removeTSLintJSONForProject,
} from '../utils';

function eslintRelatedChanges(options: Schema) {
  /**
   * The types coming from the @schematics/angular schema seem to be wrong, if name isn't
   * provided the interactive CLI prompt will throw
   */
  const projectName: string = options.name!;
  return chain([
    // Update the lint builder and config in angular.json
    addESLintTargetToProject(projectName, 'lint'),
    // Create the ESLint config file for the project
    createESLintConfigForProject(projectName),
    // Delete the TSLint config file for the project
    removeTSLintJSONForProject(projectName),
  ]);
}

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([
      externalSchematic('@schematics/angular', 'library', options),
      eslintRelatedChanges(options),
    ])(host, context);
  };
}
