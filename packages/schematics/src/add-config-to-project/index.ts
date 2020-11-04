import {
  apply,
  chain,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  addESLintTargetToProject,
  getProjectConfig,
  offsetFromRoot,
} from '../utils';
import { Schema } from './schema';

function createConfigFilesForProject(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
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

    const rootESLintConfigFile = host.get('.eslintrc.json');
    if (!rootESLintConfigFile) {
      context.logger.info(
        'Could not find a `.eslintrc.json` file at the root of your project, one will be created automatically...',
      );
    }

    return chain([
      // Create missing .eslintrc.json at the root, if applicable
      rootESLintConfigFile
        ? noop()
        : mergeWith(
            apply(url(`./files/root-files`), [
              template({
                ...options,
                tmpl: '',
              }),
              move(host.root.path),
            ]),
          ),
      () => {
        const newRootESLintConfigFile = host.get('.eslintrc.json')!;
        // Remove the leading slash that the Tree applies to the path
        const rootESLintConfigPathWithoutLeadingSlash = newRootESLintConfigFile.path.slice(
          1,
          newRootESLintConfigFile.path.length,
        );

        const relativeOffsetFromRoot = offsetFromRoot(projectRoot);

        return mergeWith(
          apply(url(`./files/project-files`), [
            template({
              ...options,
              tmpl: '',
              offsetFromRoot: relativeOffsetFromRoot,
              rootESLintConfigPath: `${relativeOffsetFromRoot}${rootESLintConfigPathWithoutLeadingSlash}`,
              parserOptionsProject: JSON.stringify([
                `${projectRoot}/tsconfig.*?.json`,
                `${projectRoot}/e2e/tsconfig.json`,
              ]),
              /**
               * The `createDefaultProgram` fallback should rarely be used as it can facilitate
               * highly non-performant lint configurations, however it is required specifically
               * for Angular applications because of the use of the somewhat magical environment.prod.ts
               * etc files which are not referenced within any configured tsconfig.
               *
               * Using this is the only way for us to avoid having a dedicated tsconfig.eslint.json file
               * for each project.
               *
               * More information about the option can be found here:
               * https://github.com/typescript-eslint/typescript-eslint/tree/f887ab51f58c1b3571f9a14832864bc0ca59623f/packages/parser#parseroptionscreatedefaultprogram
               */
              parserCreateDefaultProgram: true,
            }),
            move(projectRoot),
          ]),
        );
      },
    ]);
  };
}

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([
      createConfigFilesForProject(options),
      // Add a new target called "eslint" (do not overwrite "lint")
      addESLintTargetToProject(options.project, 'eslint'),
    ])(host, context);
  };
}
