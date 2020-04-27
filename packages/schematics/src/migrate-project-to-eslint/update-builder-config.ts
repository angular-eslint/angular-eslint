import { updateWorkspaceInTree } from './nx-utils/update-workspace';
import { Schema } from './schema';
import { Rule } from '@angular-devkit/schematics';
import { normalize, join } from 'path';

export function updateBuilderConfig(options: Schema): Rule {
  return updateWorkspaceInTree(json => {
    const projectConfig = json.projects[options.projectName];
    const projectRoot = normalize(projectConfig.root);
    projectConfig.architect.lint = {
      builder: '@angular-eslint/builder:lint',
      options: {
        eslintConfig: join(projectRoot, '.eslintrc.json'),
        tsConfig: [
          join(projectRoot, 'tsconfig.app.json'),
          join(projectRoot, 'tsconfig.spec.json'),
          join(projectRoot, 'e2e/tsconfig.json'),
        ],
        exclude: ['**/node_modules/**'],
      },
    };
    return json;
  });
}
