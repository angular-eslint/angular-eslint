import {
  exampleProjectTslintJson,
  exampleRootTslintJson,
} from './example-tslint-configs';

// Since upgrading to (ts-)jest 26 this usage of this mock has caused issues...
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const {
  mockFindReportedConfiguration,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('./mock-tslint-to-eslint-config');

/**
 * See ./mock-tslint-to-eslint-config.ts for why this is needed
 */
jest.mock('tslint-to-eslint-config', () => {
  return {
    // Since upgrading to (ts-)jest 26 this usage of this mock has caused issues...
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...jest.requireActual('tslint-to-eslint-config'),
    findReportedConfiguration: jest.fn(mockFindReportedConfiguration),
  };
});

const {
  createConvertToESLintConfig,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('../../src/convert-tslint-to-eslint/convert-to-eslint-config');

const convertToESLintConfig = createConvertToESLintConfig({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logger: { info: () => {} },
});

describe('convertToESLintConfig()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work for a root tslint.json file', async () => {
    const converted = await convertToESLintConfig(
      'tslint.json',
      exampleRootTslintJson.raw,
    );
    // Ensure no-console snapshot is deterministic
    converted.convertedESLintConfig.rules['no-console'][1].allow.sort();
    expect(converted).toMatchInlineSnapshot(`
      Object {
        "convertedESLintConfig": Object {
          "env": Object {
            "browser": true,
            "es6": true,
            "node": true,
          },
          "extends": Array [
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking",
          ],
          "parser": "@typescript-eslint/parser",
          "parserOptions": Object {
            "project": "tsconfig.json",
            "sourceType": "module",
          },
          "plugins": Array [
            "eslint-plugin-jsdoc",
            "eslint-plugin-prefer-arrow",
            "eslint-plugin-import",
            "@angular-eslint/eslint-plugin",
            "@angular-eslint/eslint-plugin-template",
            "@typescript-eslint",
            "@typescript-eslint/tslint",
          ],
          "rules": Object {
            "@angular-eslint/component-class-suffix": "error",
            "@angular-eslint/component-selector": Array [
              "error",
              Object {
                "prefix": "app",
                "style": "kebab-case",
                "type": "element",
              },
            ],
            "@angular-eslint/contextual-lifecycle": "error",
            "@angular-eslint/directive-class-suffix": "error",
            "@angular-eslint/directive-selector": Array [
              "error",
              Object {
                "prefix": "app",
                "style": "camelCase",
                "type": "attribute",
              },
            ],
            "@angular-eslint/no-conflicting-lifecycle": "error",
            "@angular-eslint/no-host-metadata-property": "error",
            "@angular-eslint/no-input-rename": "error",
            "@angular-eslint/no-inputs-metadata-property": "error",
            "@angular-eslint/no-output-native": "error",
            "@angular-eslint/no-output-on-prefix": "error",
            "@angular-eslint/no-output-rename": "error",
            "@angular-eslint/no-outputs-metadata-property": "error",
            "@angular-eslint/template/banana-in-box": "error",
            "@angular-eslint/template/eqeqeq": "error",
            "@angular-eslint/template/no-negated-async": "error",
            "@angular-eslint/use-lifecycle-interface": "error",
            "@angular-eslint/use-pipe-transform-interface": "error",
            "@typescript-eslint/adjacent-overload-signatures": "error",
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/ban-types": Array [
              "error",
              Object {
                "types": Object {
                  "Boolean": Object {
                    "message": "Avoid using the \`Boolean\` type. Did you mean \`boolean\`?",
                  },
                  "Function": Object {
                    "message": "Avoid using the \`Function\` type. Prefer a specific function type, like \`() => void\`.",
                  },
                  "Number": Object {
                    "message": "Avoid using the \`Number\` type. Did you mean \`number\`?",
                  },
                  "Object": Object {
                    "message": "Avoid using the \`Object\` type. Did you mean \`object\`?",
                  },
                  "String": Object {
                    "message": "Avoid using the \`String\` type. Did you mean \`string\`?",
                  },
                  "Symbol": Object {
                    "message": "Avoid using the \`Symbol\` type. Did you mean \`symbol\`?",
                  },
                },
              },
            ],
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/dot-notation": "error",
            "@typescript-eslint/indent": Array [
              "error",
              4,
              Object {
                "FunctionDeclaration": Object {
                  "parameters": "first",
                },
                "FunctionExpression": Object {
                  "parameters": "first",
                },
              },
            ],
            "@typescript-eslint/member-delimiter-style": Array [
              "error",
              Object {
                "multiline": Object {
                  "delimiter": "semi",
                  "requireLast": true,
                },
                "singleline": Object {
                  "delimiter": "semi",
                  "requireLast": false,
                },
              },
            ],
            "@typescript-eslint/member-ordering": "error",
            "@typescript-eslint/naming-convention": "error",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": Array [
              "error",
              Object {
                "ignoreParameters": true,
              },
            ],
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/no-parameter-properties": "off",
            "@typescript-eslint/no-shadow": Array [
              "error",
              Object {
                "hoist": "all",
              },
            ],
            "@typescript-eslint/no-unused-expressions": "error",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-namespace-keyword": "error",
            "@typescript-eslint/quotes": Array [
              "error",
              "double",
            ],
            "@typescript-eslint/semi": Array [
              "error",
              "always",
            ],
            "@typescript-eslint/triple-slash-reference": Array [
              "error",
              Object {
                "lib": "always",
                "path": "always",
                "types": "prefer-import",
              },
            ],
            "@typescript-eslint/tslint/config": Array [
              "error",
              Object {
                "rules": Object {
                  "import-spacing": true,
                  "typedef": Array [
                    true,
                    "call-signature",
                  ],
                  "whitespace": Array [
                    true,
                    "check-branch",
                    "check-decl",
                    "check-operator",
                    "check-separator",
                    "check-type",
                    "check-typecast",
                  ],
                },
                "rulesDirectory": Array [
                  "/node_modules/codelyzer",
                ],
              },
            ],
            "@typescript-eslint/type-annotation-spacing": "error",
            "@typescript-eslint/unified-signatures": "error",
            "arrow-body-style": "error",
            "complexity": "off",
            "constructor-super": "error",
            "curly": "error",
            "eol-last": "error",
            "eqeqeq": Array [
              "error",
              "smart",
            ],
            "guard-for-in": "error",
            "id-blacklist": Array [
              "error",
              "any",
              "Number",
              "number",
              "String",
              "string",
              "Boolean",
              "boolean",
              "Undefined",
              "undefined",
            ],
            "id-match": "error",
            "import/no-deprecated": "warn",
            "jsdoc/check-alignment": "error",
            "jsdoc/check-indentation": "error",
            "jsdoc/newline-after-description": "error",
            "jsdoc/no-types": "error",
            "max-classes-per-file": "off",
            "max-len": Array [
              "error",
              Object {
                "code": 140,
              },
            ],
            "new-parens": "error",
            "no-bitwise": "error",
            "no-caller": "error",
            "no-cond-assign": "error",
            "no-console": Array [
              "error",
              Object {
                "allow": Array [
                  "Console",
                  "_buffer",
                  "_counters",
                  "_groupDepth",
                  "_timers",
                  "assert",
                  "clear",
                  "count",
                  "countReset",
                  "dir",
                  "dirxml",
                  "error",
                  "group",
                  "groupCollapsed",
                  "groupEnd",
                  "log",
                  "table",
                  "timeLog",
                  "warn",
                ],
              },
            ],
            "no-debugger": "error",
            "no-empty": "off",
            "no-eval": "error",
            "no-fallthrough": "error",
            "no-invalid-this": "off",
            "no-new-wrappers": "error",
            "no-restricted-imports": Array [
              "error",
              "rxjs/Rx",
            ],
            "no-throw-literal": "error",
            "no-trailing-spaces": "error",
            "no-undef-init": "error",
            "no-underscore-dangle": "error",
            "no-unsafe-finally": "error",
            "no-unused-labels": "error",
            "no-var": "error",
            "object-shorthand": "error",
            "one-var": Array [
              "error",
              "never",
            ],
            "prefer-arrow/prefer-arrow-functions": "error",
            "prefer-const": "error",
            "quote-props": Array [
              "error",
              "as-needed",
            ],
            "radix": "error",
            "space-before-function-paren": Array [
              "error",
              Object {
                "anonymous": "never",
                "asyncArrow": "always",
                "named": "never",
              },
            ],
            "spaced-comment": Array [
              "error",
              "always",
              Object {
                "markers": Array [
                  "/",
                ],
              },
            ],
            "use-isnan": "error",
            "valid-typeof": "off",
          },
        },
        "ensureESLintPlugins": Array [],
        "unconvertedTSLintRules": Array [
          Object {
            "ruleArguments": Array [],
            "ruleName": "import-spacing",
            "ruleSeverity": "error",
          },
          Object {
            "ruleArguments": Array [
              "call-signature",
            ],
            "ruleName": "typedef",
            "ruleSeverity": "error",
          },
          Object {
            "ruleArguments": Array [
              "check-branch",
              "check-decl",
              "check-operator",
              "check-separator",
              "check-type",
              "check-typecast",
            ],
            "ruleName": "whitespace",
            "ruleSeverity": "error",
          },
        ],
      }
    `);
  });

  it('should work for a project tslint.json file', async () => {
    await expect(
      convertToESLintConfig(
        'projects/app1/tslint.json',
        exampleProjectTslintJson.raw,
      ),
    ).resolves.toMatchInlineSnapshot(`
            Object {
              "convertedESLintConfig": Object {
                "env": Object {
                  "browser": true,
                  "es6": true,
                  "node": true,
                },
                "extends": Array [
                  "prettier",
                  "prettier/@typescript-eslint",
                ],
                "parser": "@typescript-eslint/parser",
                "parserOptions": Object {
                  "project": "tsconfig.json",
                  "sourceType": "module",
                },
                "plugins": Array [
                  "@angular-eslint/eslint-plugin",
                  "@typescript-eslint",
                ],
                "rules": Object {
                  "@angular-eslint/component-selector": Array [
                    "error",
                    Object {
                      "prefix": "app",
                      "style": "kebab-case",
                      "type": "element",
                    },
                  ],
                  "@angular-eslint/directive-selector": Array [
                    "error",
                    Object {
                      "prefix": "app",
                      "style": "camelCase",
                      "type": "attribute",
                    },
                  ],
                },
              },
              "ensureESLintPlugins": Array [],
              "unconvertedTSLintRules": Array [],
            }
          `);
  });
});
