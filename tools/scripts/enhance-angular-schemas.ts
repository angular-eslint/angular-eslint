import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

(async function main() {
  const setParserOptionsProjectConfig = {
    type: 'boolean',
    description:
      'Whether or not to enable rules that require type information by configuring the ESLint `parserOptions.projectService` option. We do not do this by default for lint performance reasons. Implied when tseslintPreset is a type-checked preset.',
    default: false,
  };

  const tseslintPresetConfig = {
    type: 'string',
    enum: [
      'recommended',
      'strict',
      'recommendedTypeChecked',
      'strictTypeChecked',
    ],
    default: 'recommended',
    description:
      'Which typescript-eslint shared config preset to extend in the generated ESLint config. Type-checked presets also enable parserOptions.projectService (required for those rules, but slower). See https://typescript-eslint.io/users/configs/',
  };

  const angularEslintSchemaProperties = {
    setParserOptionsProject: setParserOptionsProjectConfig,
    tseslintPreset: tseslintPresetConfig,
  };

  const applicationSchemaJsonPath = join(
    __dirname,
    '../../packages/schematics/src/application/schema.json',
  );

  await enhanceSchemaWithProperties(
    applicationSchemaJsonPath,
    angularEslintSchemaProperties,
  );

  const librarySchemaJsonPath = join(
    __dirname,
    '../../packages/schematics/src/library/schema.json',
  );

  await enhanceSchemaWithProperties(
    librarySchemaJsonPath,
    angularEslintSchemaProperties,
  );
})();

async function enhanceSchemaWithProperties(
  schemaJsonPath: string,
  properties: Record<string, unknown>,
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const schemaJson = require(schemaJsonPath);
  const updatedSchemaJson = JSON.stringify(
    {
      ...schemaJson,
      properties: {
        ...schemaJson.properties,
        ...properties,
      },
    },
    null,
    2,
  );

  writeFileSync(
    schemaJsonPath,
    await format(updatedSchemaJson, {
      ...(await resolveConfig(schemaJsonPath)),
      parser: 'json',
    }),
  );

  console.log(
    `\n✨ Enhanced ${schemaJsonPath} with angular-eslint specific options`,
  );
}
