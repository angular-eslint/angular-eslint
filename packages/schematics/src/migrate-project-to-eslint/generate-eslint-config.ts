import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { join, relative } from 'path';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { appRootPath } from './nx-utils/app-root';
import { getWorkspace } from './nx-utils/workspace';
import { Schema } from './schema';

/**
 * Generate the ESLint config for the specified project
 *
 * @param schema The options provided to the schematic
 */
export function generateESLintConfig(schema: Schema): Rule {
  return (tree: Tree, _context: SchematicContext): Observable<Tree> => {
    return from(getWorkspace(tree)).pipe(
      map(workspace => {
        const project = workspace.projects.get(schema.projectName);
        if (!project) {
          return tree;
        }
        tree.create(
          join(project.root, '.eslintrc.json'),
          `
{
  "extends": "${relative(project.root, appRootPath)}/.eslintrc.json"
}
`.trim(),
        );
        return tree;
      }),
    );
  };
}
