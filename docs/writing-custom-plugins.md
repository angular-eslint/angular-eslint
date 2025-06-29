# Writing Custom ESLint Plugins with Angular ESLint

This guide shows you how to create custom ESLint plugins and rules that leverage the powerful utilities provided by `@angular-eslint/utils` and `@angular-eslint/test-utils`.

## Table of Contents

- [Getting Started](#getting-started)
- [Understanding the Architecture](#understanding-the-architecture)
- [Creating a TypeScript Rule](#creating-a-typescript-rule)
- [Creating an HTML Template Rule](#creating-an-html-template-rule)
- [Testing Your Rules](#testing-your-rules)
- [Consuming Your Plugin](#consuming-your-plugin)
- [Key Differences Between TypeScript and HTML Rules](#key-differences-between-typescript-and-html-rules)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js (version specified in angular-eslint's package.json)
- Understanding of ESLint concepts (rules, parsers, plugins)
- Basic knowledge of Angular and TypeScript

### Installation

First, install the required dependencies:

```bash
npm install --save-dev @angular-eslint/utils @angular-eslint/test-utils @typescript-eslint/utils
```

## Understanding the Architecture

Angular ESLint provides a rich set of utilities for building custom rules:

- **`@angular-eslint/utils`**: Core utilities for AST manipulation, Angular-specific selectors, and template parsing
- **`@angular-eslint/test-utils`**: Testing utilities with proper parser configuration
- **`ESLintUtils.RuleCreator`**: Standard typescript-eslint rule creator utility

### Key Utilities Available

From `@angular-eslint/utils`:

- `ASTUtils`: Angular-specific AST manipulation utilities
- `Selectors`: Pre-built selectors for Angular decorators and constructs
- `getTemplateParserServices`: Access to Angular template parser services
- `ensureTemplateParser`: Ensures template parser is available

From `@angular-eslint/test-utils`:

- `RuleTester`: Extended rule tester with Angular-specific configuration
- `convertAnnotatedSourceToFailureCase`: Utility for test case generation

For comprehensive information on writing custom rules with TypeScript ESLint utilities, see the [typescript-eslint custom rules guide](https://typescript-eslint.io/developers/custom-rules).

For general ESLint rule development guidance, see the [official ESLint custom rules guide](https://eslint.org/docs/latest/extend/custom-rules).

## Creating a TypeScript Rule

Let's create a custom rule that enforces a naming convention for Angular services.

### Step 1: Create the Rule File

**`src/rules/service-class-suffix.ts`**

```typescript
import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

export type Options = [
  {
    suffixes?: string[];
  },
];

export type MessageIds = 'serviceSuffix';

export const RULE_NAME = 'service-class-suffix';

export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce that service classes end with "Service"',
      recommended: 'recommended',
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffixes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      serviceSuffix:
        'Service class should end with one of these suffixes: {{suffixes}}',
    },
  },
  defaultOptions: [
    {
      suffixes: ['Service'],
    },
  ],
  create(context, [{ suffixes }]) {
    return {
      [Selectors.INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classDeclaration = node.parent as TSESTree.ClassDeclaration;

        if (!classDeclaration.id) {
          return;
        }

        const className = classDeclaration.id.name;
        const hasValidSuffix = suffixes.some((suffix) =>
          className.endsWith(suffix),
        );

        if (!hasValidSuffix) {
          context.report({
            node: classDeclaration.id,
            messageId: 'serviceSuffix',
            data: {
              suffixes: suffixes.join(', '),
            },
          });
        }
      },
    };
  },
});
```


## Creating an HTML Template Rule

Let's create a simple rule that enforces all `div` elements have a `data-foo="bar"` attribute.

**`src/rules/require-data-foo.ts`**

```typescript
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

export type Options = [];
export type MessageIds = 'requireDataFoo';
export const RULE_NAME = 'require-data-foo';

export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require data-foo="bar" attribute on div elements',
    },
    schema: [],
    messages: {
      requireDataFoo: 'div elements must have data-foo="bar" attribute',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name="div"]'(node: TmplAstElement) {
        const hasDataFoo = node.attributes.some(
          (attr) => attr.name === 'data-foo' && attr.value === 'bar',
        );

        if (!hasDataFoo) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.sourceSpan,
          );

          context.report({
            loc,
            messageId: 'requireDataFoo',
          });
        }
      },
    };
  },
});
```

## Testing Your Rules

### TypeScript Rule Tests

**`tests/rules/service-class-suffix.spec.ts`**

```typescript
import { RuleTester } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import { rule, RULE_NAME } from '../../src/rules/service-class-suffix';
import type {
  MessageIds,
  Options,
} from '../../src/rules/service-class-suffix';

const ruleTester = new RuleTester();
const messageId: MessageIds = 'serviceSuffix';

const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Injectable()
    class UserService {}
  `,
  `
    @Injectable()
    class ApiService {}
  `,
  {
    code: `
      @Injectable()
      class UserRepository {}
    `,
    options: [{ suffixes: ['Service', 'Repository'] }],
  },
];

const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  {
    code: `
      @Injectable()
      class User {}
    `,
    errors: [
      {
        messageId,
        line: 3,
        column: 13,
        endLine: 3,
        endColumn: 17,
      },
    ],
  },
  {
    code: `
      @Injectable()
      class UserManager {}
    `,
    options: [{ suffixes: ['Service'] }],
    errors: [
      {
        messageId,
        line: 3,
        column: 13,
        endLine: 3,
        endColumn: 24,
      },
    ],
  },
];

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
```

### HTML Template Rule Tests

**`tests/rules/require-data-foo.spec.ts`**

```typescript
import { RuleTester } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import { rule, RULE_NAME } from '../../src/rules/require-data-foo';
import type {
  MessageIds,
  Options,
} from '../../src/rules/require-data-foo';

const ruleTester = new RuleTester();
const messageId: MessageIds = 'requireDataFoo';

const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    <div data-foo="bar">
      Content
    </div>
  `,
  `
    <div data-foo="bar" class="example">
      More content
    </div>
  `,
  // Not a div element
  `
    <span>Content</span>
  `,
];

const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  {
    code: `
      <div>
        Content
      </div>
    `,
    errors: [
      {
        messageId,
        line: 2,
        column: 7,
        endLine: 2,
        endColumn: 12,
      },
    ],
  },
  {
    code: `
      <div data-foo="wrong">
        Content
      </div>
    `,
    errors: [
      {
        messageId,
        line: 2,
        column: 7,
        endLine: 2,
        endColumn: 28,
      },
    ],
  },
];

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
```

## Consuming Your Plugin

### Plugin Structure

Create your plugin's main export file. The `rules` export is required, while `configs` is optional but recommended for providing preset configurations:

**`src/index.ts`**

```typescript
import { rule as serviceClassSuffix, RULE_NAME as serviceClassSuffixRuleName } from './rules/service-class-suffix';
import { rule as requireDataFoo, RULE_NAME as requireDataFooRuleName } from './rules/require-data-foo';

export = {
  rules: {
    [serviceClassSuffixRuleName]: serviceClassSuffix,
    [requireDataFooRuleName]: requireDataFoo,
  },
  configs: {
    recommended: {
      plugins: ['your-plugin-name'],
      rules: {
        [`your-plugin-name/${serviceClassSuffixRuleName}`]: 'error',
        [`your-plugin-name/${requireDataFooRuleName}`]: 'warn',
      },
    },
  },
};
```

### Using in a Project

**`eslint.config.js`** (Flat Config)

```javascript
import angular from 'angular-eslint';
import yourPlugin from 'your-eslint-plugin';

export default [
  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@angular-eslint': angular.eslintPlugin,
      'your-plugin': yourPlugin,
    },
    rules: {
      // Your custom TypeScript rules
      'your-plugin/service-class-suffix': 'error',
      // Angular ESLint rules
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    },
  },
  // HTML template files
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: '@angular-eslint/template-parser',
    },
    plugins: {
      '@angular-eslint/template': angular.templatePlugin,
      'your-plugin': yourPlugin,
    },
    rules: {
      // Your custom template rules
      'your-plugin/require-data-foo': 'warn',
      // Angular ESLint template rules
      '@angular-eslint/template/banana-in-box': 'error',
    },
  },
];
```

## Key Differences Between TypeScript and HTML Rules

### TypeScript Rules

- **Parser**: Use `@typescript-eslint/parser`
- **AST**: Work with TypeScript AST nodes (`TSESTree`)
- **Selectors**: Use `Selectors.COMPONENT_CLASS_DECORATOR`, `Selectors.INJECTABLE_CLASS_DECORATOR`, etc.
- **Utilities**: Access `ASTUtils` for Angular-specific AST operations

### HTML Template Rules

- **Parser**: Use `@angular-eslint/template-parser`
- **AST**: Work with Angular template AST nodes (`TmplAstElement`, `TmplAstBoundText`, etc.) that come from the Angular compiler (which our template-parser wraps)
- **Parser Services**: Use `getTemplateParserServices(context)` for location mapping
- **Selectors**: Use CSS-like selectors (`'Element[name="div"]'`, `'BoundText'`, etc.)

For more details on configuring ESLint with different parsers, see [CONFIGURING_FLAT_CONFIG.md](./CONFIGURING_FLAT_CONFIG.md).

## Best Practices

### 1. Rule Naming

- Use descriptive, kebab-case names
- Follow Angular ESLint naming conventions
- Prefix with your plugin name to avoid conflicts

### 2. Error Messages

- Provide clear, actionable error messages
- Include context about what's wrong and how to fix it
- Use data interpolation for dynamic content

### 3. Rule Options

- Provide sensible defaults
- Make rules configurable when appropriate
- Use JSON Schema for validation

### 4. Testing

- Test both valid and invalid cases
- Include edge cases and boundary conditions
- Test with different rule configurations

### 5. Performance

- Use specific selectors to minimize AST traversal
- Avoid expensive operations in rule callbacks
- Consider caching when appropriate
- For guidance on profiling rule performance, see the [ESLint rule performance guide](https://eslint.org/docs/latest/extend/custom-rules#profile-rule-performance)

### 6. Documentation

- Document rule purpose and behavior
- Provide examples of valid and invalid code
- Include configuration options

## Real-World Examples

For more complex real-world examples of Angular ESLint rules, explore the existing rule implementations in this repository:

- **TypeScript rules**: [`packages/eslint-plugin/src/rules/`](https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin/src/rules)
- **Template rules**: [`packages/eslint-plugin-template/src/rules/`](https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin-template/src/rules)

These production rules demonstrate advanced patterns, utilities usage, and best practices for building robust Angular ESLint rules.

This guide provides a comprehensive foundation for creating custom ESLint plugins that leverage the power of Angular ESLint's utilities. The examples show fundamental patterns you can adapt for your specific needs.
