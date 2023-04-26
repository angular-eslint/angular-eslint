import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, externalSchematic } from '@angular-devkit/schematics';
/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema as AngularSchema } from '@schematics/angular/application/schema';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
} from '../utils';

interface Schema extends AngularSchema {
  setParserOptionsProject?: boolean;
}

function eslintRelatedChanges(options: Schema) {
  return chain([
    // Update the lint builder and config in angular.json
    addESLintTargetToProject(options.name, 'lint'),
    // Create the ESLint config file for the project
    createESLintConfigForProject(
      options.name,
      options.setParserOptionsProject ?? false,
    ),
  ]);
}

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    // Remove angular-eslint specific options before passing to the Angular schematic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setParserOptionsProject, ...angularOptions } = options;

    return chain([
      externalSchematic('@schematics/angular', 'application', angularOptions),
      eslintRelatedChanges(options),
    ])(host, context);
  };
}
