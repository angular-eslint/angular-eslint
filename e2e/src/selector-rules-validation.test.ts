import path from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  FIXTURES_DIR,
  Fixture,
  resetFixtureDirectory,
} from '../utils/fixtures';
import {
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgNew,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';
import {
  normalizeFixturesDir,
  normalizeVersionsOfPackagesWeDoNotControl,
} from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);
expect.addSnapshotSerializer(normalizeFixturesDir);

const fixtureDirectory = 'selector-rules-validation';
let fixture: Fixture;

describe('selector-rules-validation', () => {
  vi.setConfig({ testTimeout: LONG_TIMEOUT_MS });

  beforeAll(async () => {
    resetFixtureDirectory(fixtureDirectory);
    process.chdir(FIXTURES_DIR);

    await runNgNew(fixtureDirectory);

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    fixture = new Fixture(workspaceRoot);

    await runNgAdd();
  });

  it('should work with complete valid configuration for component-selector', async () => {
    // Update ESLint config to have complete valid configuration
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case"
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a test component with correct selector
    fixture.writeFile(
      'src/test.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>'
})
export class TestComponent {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should work with complete valid configuration for directive-selector', async () => {
    // Update ESLint config to have complete valid configuration
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase"
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a test directive with correct selector
    fixture.writeFile(
      'src/test.directive.ts',
      `import { Directive } from '@angular/core';

@Directive({
  selector: '[appTest]'
})
export class TestDirective {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should fail with incomplete configuration for component-selector (only prefix)', async () => {
    // Update ESLint config with incomplete configuration - only prefix
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "app"
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a test component
    fixture.writeFile(
      'src/test.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>'
})
export class TestComponent {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should fail with incomplete configuration for directive-selector (missing style)', async () => {
    // Update ESLint config with incomplete configuration - missing style
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app"
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a test directive
    fixture.writeFile(
      'src/test.directive.ts',
      `import { Directive } from '@angular/core';

@Directive({
  selector: '[appTest]'
})
export class TestDirective {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should fail with no configuration for component-selector', async () => {
    // Update ESLint config with no configuration for the rule
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": "error"
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a test component
    fixture.writeFile(
      'src/test.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>'
})
export class TestComponent {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should work with array configuration for multiple selector types', async () => {
    // Update ESLint config with array configuration for both element and attribute selectors
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        [
          {
            type: "element",
            prefix: "app",
            style: "kebab-case"
          },
          {
            type: "attribute",
            prefix: "app",
            style: "camelCase"
          }
        ]
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create components with both selector types
    fixture.writeFile(
      'src/element-test.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>'
})
export class ElementTestComponent {}`,
    );

    fixture.writeFile(
      'src/attribute-test.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: '[appTest]',
  template: '<div>Test</div>'
})
export class AttributeTestComponent {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should fail with incomplete array configuration (missing required fields)', async () => {
    // Update ESLint config with incomplete array configuration
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        [
          {
            type: "element",
            prefix: "app"
            // missing style
          },
          {
            type: "attribute",
            style: "camelCase"
            // missing prefix
          }
        ]
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a test component
    fixture.writeFile(
      'src/test.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>'
})
export class TestComponent {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should use default prefix "app" when no prefix is specified', async () => {
    // Update ESLint config with minimal configuration (no prefix specified)
    fixture.writeFile(
      'eslint.config.js',
      `// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          style: "kebab-case"
          // Note: prefix is NOT specified, should default to "app"
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          style: "camelCase"
          // Note: prefix is NOT specified, should default to "app"
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);`,
    );

    // Create a component without the default "app" prefix - should fail
    fixture.writeFile(
      'src/no-prefix.component.ts',
      `import { Component } from '@angular/core';

@Component({
  selector: 'test-component',  // Missing "app" prefix
  template: '<div>Test</div>'
})
export class NoPrefixComponent {}`,
    );

    // Create a directive without the default "app" prefix - should fail
    fixture.writeFile(
      'src/no-prefix.directive.ts',
      `import { Directive } from '@angular/core';

@Directive({
  selector: '[highlight]'  // Missing "app" prefix
})
export class NoPrefixDirective {}`,
    );

    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });
});
