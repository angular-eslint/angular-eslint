import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { Schema } from './schema';
import {
  getProjectConfig,
  offsetFromRoot,
  updateWorkspaceInTree,
} from './utils';

function createConfigFilesForProject(options: Schema): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const { root: projectRoot } = getProjectConfig(host, options.project);

    // The given project is a default Angular CLI project at the root of the workspace
    if (projectRoot === '') {
      return mergeWith(
        apply(url(`./files/root-files`), [
          template({
            ...options,
            tmpl: '',
          }),
          move(projectRoot),
        ]),
      );
    }

    const rootESLintConfigFile =
      host.get('.eslintrc.json') || host.get('.eslintrc.js');

    if (!rootESLintConfigFile) {
      throw new Error(
        'Could not find a `.eslintrc.json` or `.eslintrc.js` file at the root of your project. Please create one before running this schematic on an individual project',
      );
    }

    // Remove the leading slash that the Tree applies to the path
    const rootESLintConfigPathWithoutLeadingSlash = rootESLintConfigFile.path.slice(
      1,
      rootESLintConfigFile.path.length,
    );

    const relativeOffsetFromRoot = offsetFromRoot(projectRoot);

    return mergeWith(
      apply(url(`./files/project-files`), [
        template({
          ...options,
          tmpl: '',
          offsetFromRoot: relativeOffsetFromRoot,
          rootESLintConfigPath: `${relativeOffsetFromRoot}${rootESLintConfigPathWithoutLeadingSlash}`,
          eslintTSConfigFilePath: `${projectRoot}/tsconfig.eslint.json`,
        }),
        move(projectRoot),
      ]),
    );
  };
}

function addESLintTargetToProjectConfig(options: Schema): Rule {
  return updateWorkspaceInTree((workspaceJson) => {
    const existingProjectConfig = workspaceJson.projects[options.project];

    let lintFilePatternsRoot = '';

    // Default Angular CLI project at the root of the workspace
    if (existingProjectConfig.root === '') {
      lintFilePatternsRoot = 'src';
    } else {
      lintFilePatternsRoot = existingProjectConfig.root;
    }

    const eslintTargetConfig = {
      builder: '@angular-eslint/builder:lint',
      options: {
        lintFilePatterns: [
          `${lintFilePatternsRoot}/**/*.ts`,
          `${lintFilePatternsRoot}/**/*.component.html`,
        ],
        exclude: ['**/node_modules/**'],
      },
    };

    existingProjectConfig.architect.eslint = eslintTargetConfig;

    return workspaceJson;
  });
}

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([
      createConfigFilesForProject(options),
      addESLintTargetToProjectConfig(options),
    ])(host, context);
  };
}
