import { chain, Rule } from '@angular-devkit/schematics';
import { checkProjectExistsAndNotYetESLint } from './check-project-exists-and-not-yet-eslint';
import { generateESLintConfig } from './generate-eslint-config';
import { Schema } from './schema';
import { updateBuilderConfig } from './update-builder-config';

export default function(schema: Schema): Rule {
  return chain([
    checkProjectExistsAndNotYetESLint(schema),
    generateESLintConfig(schema),
    updateBuilderConfig(schema),
  ]);
}
