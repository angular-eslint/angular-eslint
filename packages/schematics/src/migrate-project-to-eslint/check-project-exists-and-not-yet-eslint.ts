import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getWorkspace } from './nx-utils/workspace';
import { Schema } from './schema';

export function checkProjectExistsAndNotYetESLint(schema: Schema): Rule {
  return (tree: Tree, _context: SchematicContext): Observable<Tree> => {
    return from(getWorkspace(tree)).pipe(
      map(workspace => {
        const project = workspace.projects.get(schema.projectName);
        if (!project) {
          throw new Error(
            `Project not found in workspace: [${schema.projectName}]`,
          );
        }
        const lintTarget = project.targets.get('lint');
        if (
          lintTarget &&
          lintTarget.builder === '@angular-eslint/builder:lint'
        ) {
          throw new Error(
            `The "lint" target for the project "${schema.projectName}" is already set to use ESLint`,
          );
        }
        return tree;
      }),
    );
  };
}
