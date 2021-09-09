import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { compile } from 'json-schema-to-typescript';
import traverse from 'json-schema-traverse';
import { join, relative } from 'path';
import { format, resolveConfig } from 'prettier';
import ts from 'typescript';
import { SPECIAL_UNDERLINE_CHARS } from '../../packages/utils/src/convert-annotated-source-to-failure-case';

const plugin = process.argv[2];

if (plugin !== 'eslint-plugin-template' && plugin !== 'eslint-plugin') {
  console.error(
    `\nError: the first argument to the script must be "eslint-plugin-template" or "eslint-plugin"`,
  );
  process.exit(1);
}

const docsOutputDir = join(__dirname, `../../packages/${plugin}/docs/rules`);

const rulesDir = join(__dirname, `../../packages/${plugin}/src/rules`);
const ruleFiles = readdirSync(rulesDir);

const testDirsDir = join(__dirname, `../../packages/${plugin}/tests/rules`);
const testDirs = readdirSync(testDirsDir);

(async function main() {
  const allRuleData = await generateAllRuleData();

  for (const [ruleName, ruleData] of Object.entries(allRuleData)) {
    const {
      ruleConfig: {
        meta: {
          deprecated,
          replacedBy,
          type,
          docs: { description, category, suggestion },
          fixable,
          schema,
        },
        defaultOptions,
      },
      ruleFilePath,
      testCasesFilePath,
    } = ruleData;

    let schemaAsInterface = '';
    if (Array.isArray(schema) && schema[0]) {
      /**
       * json-schema-to-typescript does not do anything with the "default" property,
       * but it's really useful to include in the documentation, so we we apply the
       * default value in a consistent way to the "description" property before
       * converting.
       */
      traverse(schema[0], {
        allKeys: true,
        cb: (...data) => {
          const [schemaNode, , , , , , keyIndex] = data;

          let defaultValue = null;

          if (typeof schemaNode.default !== 'undefined') {
            defaultValue = schemaNode.default;
          } else if (defaultOptions?.length) {
            for (const defaultOption of defaultOptions) {
              const defaultValueForNode = defaultOption[keyIndex as string];
              if (defaultValueForNode) {
                defaultValue = defaultValueForNode;
              }
            }
          }

          if (defaultValue) {
            if (schemaNode.description) {
              schemaNode.description += '\n\n';
            } else {
              schemaNode.description = '';
            }
            const serializedDefaultValue = JSON.stringify(defaultValue);
            schemaNode.description += `Default: \`${serializedDefaultValue}\``;
            return;
          }
        },
      });
      schemaAsInterface = await compile(schema[0], 'Options', {
        bannerComment: '',
      });
      schemaAsInterface = schemaAsInterface.replace('export ', '');
    }

    const md = `
<!--

  DO NOT EDIT.

  This markdown file was autogenerated using a mixture of the following files as the source of truth for its data:
  - ${relative(docsOutputDir, ruleFilePath)}
  - ${relative(docsOutputDir, testCasesFilePath)}

  In order to update this file, it is therefore those files which need to be updated, as well as potentially the generator script:
  - ${relative(docsOutputDir, __filename)}

-->

# \`@angular-eslint/${
      plugin === 'eslint-plugin-template' ? 'template/' : ''
    }${ruleName}\`

${
  deprecated
    ? `## ⚠️ THIS RULE IS DEPRECATED\n\nPlease use ${replacedBy
        .map(
          (r: string) =>
            `\`@angular-eslint/${
              plugin === 'eslint-plugin-template' ? 'template/' : ''
            }${r}\``,
        )
        .join(', ')} instead.\n\n---\n\n`
    : ''
}${description}

- Type: ${type}
- Category: ${category}
${fixable === 'code' ? '- 🔧 Supports autofix (`--fix`)\n' : ''}
${
  suggestion
    ? '- 💡 Provides suggestions on how to fix issues (https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions)'
    : ''
}

<br>

## Rule Options

${
  schemaAsInterface
    ? `
The rule accepts an options object with the following properties:

\`\`\`ts
${schemaAsInterface}
\`\`\`
`
    : 'The rule does not have any configuration options.'
}

<br>

## Usage Examples

> The following examples are generated automatically from the actual unit tests within the plugin, so you can be assured that their behavior is accurate based on the current commit.

<br>

❌ - Examples of **incorrect** code for this rule:

${convertCodeExamplesToMarkdown(
  ruleData.invalid,
  'invalid',
  plugin === 'eslint-plugin-template' ? 'html' : 'ts',
)}

<br>

---

<br>

✅ - Examples of **correct** code for this rule:

${convertCodeExamplesToMarkdown(
  ruleData.valid,
  'valid',
  plugin === 'eslint-plugin-template' ? 'html' : 'ts',
)}
`;

    const outputFilePath = join(docsOutputDir, `${ruleName}.md`);
    writeFileSync(
      outputFilePath,
      format(md, {
        /**
         * NOTE: In the .prettierrc we set:
         * "embeddedLanguageFormatting": "off"
         *
         * ...for these docs files as it's important we don't let prettier format the
         * code samples, because otherwise it will move the ~~~ (error highlights) to
         * the wrong locations.
         */
        ...(await resolveConfig(outputFilePath)),
        parser: 'markdown',
      }),
    );
  }

  console.log(`\n✨ Updated docs for all rules in "${plugin}"`);
})();

interface RuleData {
  ruleFilePath: string;
  testCasesFilePath: string;
  ruleConfig: any;
  valid: any[];
  invalid: any[];
}

type AllRuleData = {
  [ruleName: string]: RuleData;
};

async function generateAllRuleData(): Promise<AllRuleData> {
  const ruleData: AllRuleData = {};

  // For rule sources we just import/execute the rule source file
  for (const ruleFile of ruleFiles) {
    const ruleFilePath = join(rulesDir, ruleFile.replace('.ts', ''));
    const { default: ruleConfig, RULE_NAME } = await import(ruleFilePath);
    ruleData[RULE_NAME] = {
      ruleConfig,
      ruleFilePath: ruleFilePath + '.ts',
    } as RuleData;
  }

  /**
   * For tests we want to preserve the annotated sources, so we do NOT want
   * to execute the file and instead need to parse it using the ts compiler.
   */
  for (const testDir of testDirs) {
    const testDirPath = join(testDirsDir, testDir);
    const casesFilePath = join(testDirPath, 'cases.ts');
    const testCasesContents = readFileSync(casesFilePath, 'utf-8');
    const casesSourceFile = ts.createSourceFile(
      casesFilePath,
      testCasesContents,
      ts.ScriptTarget.Latest,
      true,
    );

    const extractedValid: string[] = [];
    const extractedInvalid: string[] = [];

    const extractNodes = (node: ts.Node) => {
      if (
        ts.isVariableDeclaration(node) &&
        (node.name as any).escapedText === 'valid' &&
        node.initializer &&
        ts.isArrayLiteralExpression(node.initializer)
      ) {
        node.initializer.elements.forEach((el) => {
          if (ts.isStringLiteralLike(el)) {
            extractedValid.push(el.text);
          }
        });
      }

      if (
        ts.isVariableDeclaration(node) &&
        (node.name as any).escapedText === 'invalid' &&
        node.initializer &&
        ts.isArrayLiteralExpression(node.initializer)
      ) {
        node.initializer.elements.forEach((el) => {
          if (
            ts.isCallExpression(el) &&
            (el.expression as any).escapedText ===
              'convertAnnotatedSourceToFailureCase'
          ) {
            const config = el.arguments[0] as ts.ObjectLiteralExpression;
            config.properties.forEach((prop) => {
              if (
                ts.isPropertyAssignment(prop) &&
                (prop.name as any).escapedText === 'annotatedSource' &&
                ts.isNoSubstitutionTemplateLiteral(prop.initializer)
              ) {
                extractedInvalid.push(prop.initializer.text);
              }
            });
          }
        });
      }

      ts.forEachChild(node, extractNodes);
    };

    // Extract valid and invalid cases as strings
    extractNodes(casesSourceFile);

    ruleData[testDir] = {
      ...ruleData[testDir],
      testCasesFilePath: casesFilePath,
      valid: extractedValid,
      invalid: extractedInvalid,
    };
  }

  return ruleData;
}

function standardizeSpecialUnderlineChar(str: string): string {
  /**
   * It is important that we only update special characters when we are on a line
   * which only has special characters on it (as well as whitespace). Otherwise
   * we will end up replacing real characters from the source code in the example.
   */
  const specialCharsOrWhitespaceRegExp = new RegExp(
    `^(${SPECIAL_UNDERLINE_CHARS.map(escapeRegExp).join('|')}|\\s)+$`,
  );
  const whitespaceOnlyRegExp = /^\s+$/;

  return str
    .split('\n')
    .map((line) => {
      // Is line with exclusively special characters and whitespace (but not just whitespace)?
      if (
        !line.match(whitespaceOnlyRegExp) &&
        line.match(specialCharsOrWhitespaceRegExp)
      ) {
        return line
          .split('')
          .map((char) =>
            SPECIAL_UNDERLINE_CHARS.includes(char as any) ? '~' : char,
          )
          .join('');
      }
      return line;
    })
    .join('\n');
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function convertCodeExamplesToMarkdown(
  codeExamples: string[] = [],
  kind: 'valid' | 'invalid',
  highligher: 'html' | 'ts',
): string {
  return codeExamples
    .map((code) => {
      let formattedCode = removeLeadingAndTrailingEmptyLinesFromCodeExample(
        removeLeadingIndentationFromCodeExample(code),
      );
      if (kind === 'invalid') {
        formattedCode = standardizeSpecialUnderlineChar(formattedCode);
      }
      return `
\`\`\`${highligher}
${formattedCode}
\`\`\`
  `;
    })
    .join('\n');
}

function removeLeadingAndTrailingEmptyLinesFromCodeExample(
  code: string,
): string {
  const lines = code.split('\n');

  let currentLineIndex = 0;
  let firstNonEmptyLineIndex = -1;
  let lastNonEmptyLineIndex = -1;

  for (const line of lines) {
    if (/\S/.test(line)) {
      if (firstNonEmptyLineIndex === -1) {
        firstNonEmptyLineIndex = currentLineIndex;
      }
      lastNonEmptyLineIndex = currentLineIndex;
    }
    currentLineIndex++;
  }

  return lines
    .filter((_, index) => {
      if (index < firstNonEmptyLineIndex) {
        return false;
      }
      if (index > lastNonEmptyLineIndex) {
        return false;
      }
      return true;
    })
    .join('\n');
}

/**
 * We want to remove unnecessary leading padding, but keeping everything relative,
 * so that code indentation is not messed up
 */
function removeLeadingIndentationFromCodeExample(code: string): string {
  let detectedAmountToTrim: number | null = null;

  return code
    .split('\n')
    .map((line) => {
      // Is whitespace-only line, ignore
      if (!/\S/.test(line)) {
        return line;
      }

      // Haven't yet determined the number of characters to trim from the beginning of each line
      const charsInLine = line.split('');
      if (typeof detectedAmountToTrim !== 'number') {
        let numberOfLeadingWhitespaceChars = 0;
        for (const char of charsInLine) {
          if (!/\S/.test(char)) {
            numberOfLeadingWhitespaceChars++;
            continue;
          }
          break;
        }
        detectedAmountToTrim = numberOfLeadingWhitespaceChars;
      }

      // Trim the detected number of characters from the beginning of the current line
      return (
        line
          .split('')
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .filter((_, i) => !(i < detectedAmountToTrim!))
          .join('')
      );
    })
    .join('\n');
}
