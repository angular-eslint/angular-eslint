import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, externalSchematic } from '@angular-devkit/schematics';
/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema as AngularSchema } from '@schematics/angular/library/schema';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  resolveTseslintPreset,
  type TseslintPreset,
} from '../utils';

interface Schema extends AngularSchema {
  setParserOptionsProject?: boolean;
  tseslintPreset?: TseslintPreset;
}

function eslintRelatedChanges(options: Schema) {
  return chain([
    // Create the ESLint config file for the project
    createESLintConfigForProject(
      options.name,
      options.setParserOptionsProject ?? false,
      resolveTseslintPreset(options.tseslintPreset),
    ),
    // Update the lint builder and config in angular.json
    addESLintTargetToProject(options.name, 'lint'),
  ]);
}

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    // Remove angular-eslint specific options before passing to the Angular schematic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setParserOptionsProject, tseslintPreset, ...angularOptions } =
      options;

    return chain([
      externalSchematic('@schematics/angular', 'library', angularOptions),
      eslintRelatedChanges(options),
    ])(host, context);
  };
}
