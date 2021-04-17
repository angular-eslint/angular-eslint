import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, externalSchematic } from '@angular-devkit/schematics';
/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema } from '@schematics/angular/application/schema';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  removeTSLintJSONForProject,
} from '../utils';

function eslintRelatedChanges(options: Schema) {
  return chain([
    // Update the lint builder and config in angular.json
    addESLintTargetToProject(options.name, 'lint'),
    // Create the ESLint config file for the project
    createESLintConfigForProject(options.name),
    // Delete the TSLint config file for the project
    removeTSLintJSONForProject(options.name),
  ]);
}

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([
      externalSchematic('@schematics/angular', 'application', options),
      eslintRelatedChanges(options),
    ])(host, context);
  };
}
