import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  chain,
  externalSchematic,
  schematic,
} from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema } from '@schematics/angular/workspace/schema';

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    /**
     * This appeared to be the only way to schedule clean up work on e.g. tslint.json
     * because there are parts of the @schematics/angular workspace schematic as they
     * exist today which will error if tslint.json is not present.
     */
    context.addTask(
      new RunSchematicTask('workspace-post', { name: options.name }),
    );

    return chain([
      // Invoke the standard Angular CLI workspace generation
      externalSchematic('@schematics/angular', 'workspace', options),
      // Add all the relevant dependencies
      schematic('ng-add', {}),
    ])(host, context);
  };
}
