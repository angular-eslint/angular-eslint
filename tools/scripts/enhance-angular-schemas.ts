import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

(async function main() {
  const setParserOptionsProjectConfig = {
    type: 'boolean',
    description:
      'Whether or not to configure the ESLint `parserOptions.project` option. We do not do this by default for lint performance reasons.',
    default: false,
  };

  const applicationSchemaJsonPath = join(
    __dirname,
    '../../packages/schematics/src/application/schema.json',
  );

  await enhanceSchemaWithProperties(applicationSchemaJsonPath, {
    setParserOptionsProject: setParserOptionsProjectConfig,
  });

  const librarySchemaJsonPath = join(
    __dirname,
    '../../packages/schematics/src/library/schema.json',
  );

  await enhanceSchemaWithProperties(librarySchemaJsonPath, {
    setParserOptionsProject: setParserOptionsProjectConfig,
  });
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
