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
- **`createESLintRule`**: Factory function for creating rules with proper TypeScript support

### Key Utilities Available

From `@angular-eslint/utils`:

- `ASTUtils`: Angular-specific AST manipulation utilities
- `Selectors`: Pre-built selectors for Angular decorators and constructs
- `getTemplateParserServices`: Access to Angular template parser services
- `ensureTemplateParser`: Ensures template parser is available

From `@angular-eslint/test-utils`:

- `RuleTester`: Extended rule tester with Angular-specific configuration
- `convertAnnotatedSourceToFailureCase`: Utility for test case generation

## Creating a TypeScript Rule

Let's create a custom rule that enforces a naming convention for Angular services.

### Step 1: Create the Rule File

**`src/rules/service-class-suffix.ts`**

```typescript
import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    suffixes?: string[];
  },
];

export type MessageIds = 'serviceSuffix';

export const RULE_NAME = 'service-class-suffix';

export default createESLintRule<Options, MessageIds>({
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

### Step 2: Create the Rule Utility

**`src/utils/create-eslint-rule.ts`**

```typescript
import { ESLintUtils } from '@typescript-eslint/utils';

export interface RuleDocs {
  recommended?: string;
}

const patchedRuleCreator: typeof ESLintUtils.RuleCreator = (urlCreator) => {
  return function createRule({ name, meta, defaultOptions, create }) {
    return {
      meta: Object.assign(Object.assign({}, meta), {
        docs: Object.assign(Object.assign({}, meta.docs), {
          url: urlCreator(name),
        }),
      }),
      defaultOptions,
      create(context) {
        const optionsWithDefault = ESLintUtils.applyDefault(
          defaultOptions,
          context.options,
        );
        return create(context, optionsWithDefault);
      },
    };
  };
};

patchedRuleCreator.withoutDocs = ESLintUtils.RuleCreator.withoutDocs;

export const createESLintRule = patchedRuleCreator<RuleDocs>(
  (ruleName) =>
    `https://github.com/your-org/your-eslint-plugin/blob/main/docs/rules/${ruleName}.md`,
);
```

## Creating an HTML Template Rule

Let's create a rule that enforces the use of trackBy functions in ngFor loops.

**`src/rules/require-trackby-function.ts`**

```typescript
import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'requireTrackBy';
export const RULE_NAME = 'require-trackby-function';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require trackBy function in ngFor loops for better performance',
    },
    schema: [],
    messages: {
      requireTrackBy:
        'Missing trackBy function in ngFor loop. Consider adding trackBy for better performance.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      // Selector for elements with *ngFor directive
      'Element[inputs]'(node: TmplAstElement) {
        const ngForInput = node.inputs.find(
          (input) => input.name === 'ngForOf' || input.name === 'ngFor',
        );

        if (!ngForInput) {
          return;
        }

        // Check if trackBy is present
        const hasTrackBy = node.inputs.some(
          (input) => input.name === 'ngForTrackBy',
        );

        if (!hasTrackBy) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.sourceSpan,
          );

          context.report({
            loc,
            messageId: 'requireTrackBy',
          });
        }
      },
    };
  },
});
```

## Testing Your Rules

### TypeScript Rule Tests

**`tests/rules/service-class-suffix/spec.ts`**

```typescript
import { RuleTester } from '@angular-eslint/test-utils';
import rule, { RULE_NAME } from '../../../src/rules/service-class-suffix';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
```

**`tests/rules/service-class-suffix/cases.ts`**

```typescript
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/service-class-suffix';

const messageId: MessageIds = 'serviceSuffix';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
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

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
```

### HTML Template Rule Tests

**`tests/rules/require-trackby-function/spec.ts`**

```typescript
import { RuleTester } from '@angular-eslint/test-utils';
import rule, { RULE_NAME } from '../../../src/rules/require-trackby-function';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
```

**`tests/rules/require-trackby-function/cases.ts`**

```typescript
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/require-trackby-function';

const messageId: MessageIds = 'requireTrackBy';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    <div *ngFor="let item of items; trackBy: trackByFn">
      {{ item.name }}
    </div>
  `,
  `
    <ng-container *ngFor="let user of users; trackBy: trackByUserId">
      <div>{{ user.name }}</div>
    </ng-container>
  `,
  // Not an ngFor loop
  `
    <div *ngIf="condition">
      Content
    </div>
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  {
    code: `
      <div *ngFor="let item of items">
        {{ item.name }}
      </div>
    `,
    errors: [
      {
        messageId,
        line: 2,
        column: 7,
        endLine: 2,
        endColumn: 38,
      },
    ],
  },
  {
    code: `
      <ng-container *ngFor="let user of users">
        <div>{{ user.name }}</div>
      </ng-container>
    `,
    errors: [
      {
        messageId,
        line: 2,
        column: 7,
        endLine: 2,
        endColumn: 44,
      },
    ],
  },
];
```

## Consuming Your Plugin

### Plugin Structure

Create your plugin's main export file:

**`src/index.ts`**

```typescript
import serviceClassSuffix, {
  RULE_NAME as serviceClassSuffixRuleName,
} from './rules/service-class-suffix';
import requireTrackbyFunction, {
  RULE_NAME as requireTrackbyFunctionRuleName,
} from './rules/require-trackby-function';

export = {
  configs: {
    recommended: {
      plugins: ['your-plugin-name'],
      rules: {
        [`your-plugin-name/${serviceClassSuffixRuleName}`]: 'error',
        [`your-plugin-name/${requireTrackbyFunctionRuleName}`]: 'warn',
      },
    },
  },
  rules: {
    [serviceClassSuffixRuleName]: serviceClassSuffix,
    [requireTrackbyFunctionRuleName]: requireTrackbyFunction,
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
      'your-plugin/require-trackby-function': 'warn',
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
- **AST**: Work with Angular template AST nodes (`TmplAstElement`, `TmplAstBoundText`, etc.)
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

### 6. Documentation

- Document rule purpose and behavior
- Provide examples of valid and invalid code
- Include configuration options

## Advanced Examples

### Using Angular-Specific Utilities

```typescript
import { ASTUtils, Selectors } from '@angular-eslint/utils';

// Get decorator property value
const selector = ASTUtils.getDecoratorPropertyValue(decoratorNode, 'selector');

// Check if node is a specific type
if (ASTUtils.isLiteral(node)) {
  // Handle literal value
}

// Get decorator metadata
const metadata = ASTUtils.getDecoratorArgument(decoratorNode);
```

### Template Rule with Complex Logic

```typescript
export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    // ... meta configuration
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name="button"]'(node: TmplAstElement) {
        // Check for accessibility attributes
        const hasType = node.attributes.some((attr) => attr.name === 'type');
        const hasAriaLabel = node.attributes.some(
          (attr) =>
            attr.name === 'aria-label' || attr.name === 'aria-labelledby',
        );

        if (!hasType && !hasAriaLabel) {
          const loc = parserServices.convertElementSourceSpanToLoc(
            context,
            node,
          );

          context.report({
            loc,
            messageId: 'missingAccessibility',
          });
        }
      },
    };
  },
});
```

This guide provides a comprehensive foundation for creating custom ESLint plugins that leverage the power of Angular ESLint's utilities. The examples show real-world patterns you can adapt for your specific needs.
