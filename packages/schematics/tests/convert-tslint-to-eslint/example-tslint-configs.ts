// Based on latest Angular project root tslint.json
export const exampleRootTslintJson = {
  raw: {
    extends: 'tslint:recommended',
    rulesDirectory: ['codelyzer'],
    rules: {
      align: {
        options: ['parameters', 'statements'],
      },
      'array-type': false,
      'arrow-return-shorthand': true,
      curly: true,
      deprecation: {
        severity: 'warning',
      },
      eofline: true,
      'import-blacklist': [true, 'rxjs/Rx'],
      'import-spacing': true,
      indent: {
        options: ['spaces'],
      },
      'max-classes-per-file': false,
      'max-line-length': [true, 140],
      'member-ordering': [
        true,
        {
          order: [
            'static-field',
            'instance-field',
            'static-method',
            'instance-method',
          ],
        },
      ],
      'no-console': [true, 'debug', 'info', 'time', 'timeEnd', 'trace'],
      'no-empty': false,
      'no-inferrable-types': [true, 'ignore-params'],
      'no-non-null-assertion': true,
      'no-redundant-jsdoc': true,
      'no-switch-case-fall-through': true,
      'no-var-requires': false,
      'object-literal-key-quotes': [true, 'as-needed'],
      quotemark: [true, 'single'],
      semicolon: {
        options: ['always'],
      },
      'space-before-function-paren': {
        options: {
          anonymous: 'never',
          asyncArrow: 'always',
          constructor: 'never',
          method: 'never',
          named: 'never',
        },
      },
      typedef: [true, 'call-signature'],
      'typedef-whitespace': {
        options: [
          {
            'call-signature': 'nospace',
            'index-signature': 'nospace',
            parameter: 'nospace',
            'property-declaration': 'nospace',
            'variable-declaration': 'nospace',
          },
          {
            'call-signature': 'onespace',
            'index-signature': 'onespace',
            parameter: 'onespace',
            'property-declaration': 'onespace',
            'variable-declaration': 'onespace',
          },
        ],
      },
      'variable-name': {
        options: ['ban-keywords', 'check-format', 'allow-pascal-case'],
      },
      whitespace: {
        options: [
          'check-branch',
          'check-decl',
          'check-operator',
          'check-separator',
          'check-type',
          'check-typecast',
        ],
      },
      'component-class-suffix': true,
      'contextual-lifecycle': true,
      'directive-class-suffix': true,
      'no-conflicting-lifecycle': true,
      'no-host-metadata-property': true,
      'no-input-rename': true,
      'no-inputs-metadata-property': true,
      'no-output-native': true,
      'no-output-on-prefix': true,
      'no-output-rename': true,
      'no-outputs-metadata-property': true,
      'template-banana-in-box': true,
      'template-no-negated-async': true,
      'use-lifecycle-interface': true,
      'use-pipe-transform-interface': true,
      'directive-selector': [true, 'attribute', 'app', 'camelCase'],
      'component-selector': [true, 'element', 'app', 'kebab-case'],
    },
  },
  tslintPrintConfigResult: {
    extends: [],
    jsRules: {
      'class-name': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      forin: {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'import-spacing': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'jsdoc-format': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'label-position': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'new-parens': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-arg': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-bitwise': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-conditional-assignment': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-consecutive-blank-lines': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-console': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-construct': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-debugger': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-duplicate-super': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-duplicate-variable': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-empty': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-eval': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-reference': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-shadowed-variable': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-string-literal': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-string-throw': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-switch-case-fall-through': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'no-unused-expression': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-use-before-declare': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'one-variable-per-declaration': {
        ruleArguments: ['ignore-for-loop'],
        ruleSeverity: 'error',
      },
      radix: {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'triple-equals': {
        ruleArguments: ['allow-null-check'],
        ruleSeverity: 'error',
      },
      'use-isnan': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'variable-name': {
        ruleArguments: [
          'allow-leading-underscore',
          'ban-keywords',
          'check-format',
          'allow-pascal-case',
        ],
        ruleSeverity: 'error',
      },
    },
    linterOptions: {},
    rules: {
      'adjacent-overload-signatures': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'array-type': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'ban-types': {
        ruleArguments: [
          ['Object', 'Avoid using the `Object` type. Did you mean `object`?'],
          [
            'Function',
            'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
          ],
          [
            'Boolean',
            'Avoid using the `Boolean` type. Did you mean `boolean`?',
          ],
          ['Number', 'Avoid using the `Number` type. Did you mean `number`?'],
          ['String', 'Avoid using the `String` type. Did you mean `string`?'],
          ['Symbol', 'Avoid using the `Symbol` type. Did you mean `symbol`?'],
        ],
        ruleSeverity: 'error',
      },
      'callable-types': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'class-name': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'comment-format': {
        ruleArguments: ['check-space'],
        ruleSeverity: 'error',
      },
      'cyclomatic-complexity': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      forin: {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'jsdoc-format': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'label-position': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'max-classes-per-file': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'new-parens': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-angle-bracket-type-assertion': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-any': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'no-arg': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-bitwise': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-conditional-assignment': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-console': {
        ruleArguments: ['debug', 'info', 'time', 'timeEnd', 'trace'],
        ruleSeverity: 'error',
      },
      'no-construct': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-debugger': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-duplicate-super': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-empty': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'no-empty-interface': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-eval': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-internal-module': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-invalid-this': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'no-misused-new': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-namespace': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-parameter-properties': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'no-reference': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-reference-import': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-shadowed-variable': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-string-literal': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-string-throw': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-switch-case-fall-through': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-trailing-whitespace': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-unnecessary-initializer': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-unsafe-finally': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-unused-expression': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-use-before-declare': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'no-var-keyword': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-var-requires': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'object-literal-shorthand': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'one-variable-per-declaration': {
        ruleArguments: ['ignore-for-loop'],
        ruleSeverity: 'error',
      },
      'only-arrow-functions': {
        ruleArguments: ['allow-declarations', 'allow-named-functions'],
        ruleSeverity: 'error',
      },
      'prefer-const': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'prefer-for-of': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      radix: {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'triple-equals': {
        ruleArguments: ['allow-null-check'],
        ruleSeverity: 'error',
      },
      typedef: {
        ruleArguments: ['call-signature'],
        ruleSeverity: 'error',
      },
      'typeof-compare': {
        ruleArguments: [],
        ruleSeverity: 'off',
      },
      'unified-signatures': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'use-isnan': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'variable-name': {
        ruleArguments: ['ban-keywords', 'check-format', 'allow-pascal-case'],
        ruleSeverity: 'error',
      },
      align: {
        ruleArguments: ['parameters', 'statements'],
        ruleSeverity: 'error',
      },
      'arrow-return-shorthand': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      curly: {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      deprecation: {
        ruleSeverity: 'warning',
      },
      eofline: {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'import-blacklist': {
        ruleArguments: ['rxjs/Rx'],
        ruleSeverity: 'error',
      },
      'import-spacing': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      indent: {
        ruleArguments: ['spaces'],
        ruleSeverity: 'error',
      },
      'max-line-length': {
        ruleArguments: [140],
        ruleSeverity: 'error',
      },
      'member-ordering': {
        ruleArguments: [
          {
            order: [
              'static-field',
              'instance-field',
              'static-method',
              'instance-method',
            ],
          },
        ],
        ruleSeverity: 'error',
      },
      'no-inferrable-types': {
        ruleArguments: ['ignore-params'],
        ruleSeverity: 'error',
      },
      'no-non-null-assertion': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-redundant-jsdoc': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'object-literal-key-quotes': {
        ruleArguments: ['as-needed'],
        ruleSeverity: 'error',
      },
      quotemark: {
        ruleArguments: ['single'],
        ruleSeverity: 'error',
      },
      semicolon: {
        ruleArguments: ['always'],
        ruleSeverity: 'error',
      },
      'space-before-function-paren': {
        ruleArguments: [
          {
            anonymous: 'never',
            asyncArrow: 'always',
            constructor: 'never',
            method: 'never',
            named: 'never',
          },
        ],
        ruleSeverity: 'error',
      },
      'typedef-whitespace': {
        ruleArguments: [
          {
            'call-signature': 'nospace',
            'index-signature': 'nospace',
            parameter: 'nospace',
            'property-declaration': 'nospace',
            'variable-declaration': 'nospace',
          },
          {
            'call-signature': 'onespace',
            'index-signature': 'onespace',
            parameter: 'onespace',
            'property-declaration': 'onespace',
            'variable-declaration': 'onespace',
          },
        ],
        ruleSeverity: 'error',
      },
      whitespace: {
        ruleArguments: [
          'check-branch',
          'check-decl',
          'check-operator',
          'check-separator',
          'check-type',
          'check-typecast',
        ],
        ruleSeverity: 'error',
      },
      'component-class-suffix': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'contextual-lifecycle': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'directive-class-suffix': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-conflicting-lifecycle': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-host-metadata-property': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-input-rename': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-inputs-metadata-property': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-output-native': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-output-on-prefix': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-output-rename': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'no-outputs-metadata-property': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'template-banana-in-box': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'template-no-negated-async': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'use-lifecycle-interface': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'use-pipe-transform-interface': {
        ruleArguments: [],
        ruleSeverity: 'error',
      },
      'directive-selector': {
        ruleArguments: ['attribute', 'app', 'camelCase'],
        ruleSeverity: 'error',
      },
      'component-selector': {
        ruleArguments: ['element', 'app', 'kebab-case'],
        ruleSeverity: 'error',
      },
    },
    rulesDirectory: ['/node_modules/codelyzer'],
  },
};

export const exampleProjectTslintJson = {
  raw: {
    extends: '../../tslint.json',
    rules: {
      'directive-selector': [true, 'attribute', 'app', 'camelCase'],
      'component-selector': [true, 'element', 'app', 'kebab-case'],
    },
  },
  // AFTER having removed extends root (to avoid duplication)
  tslintPrintConfigResult: {
    extends: [],
    jsRules: {},
    linterOptions: {},
    rules: {
      'directive-selector': {
        ruleArguments: ['attribute', 'app', 'camelCase'],
        ruleSeverity: 'error',
      },
      'component-selector': {
        ruleArguments: ['element', 'app', 'kebab-case'],
        ruleSeverity: 'error',
      },
    },
    rulesDirectory: [],
  },
};
