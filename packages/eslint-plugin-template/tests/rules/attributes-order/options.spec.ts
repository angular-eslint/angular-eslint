import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import rule, {
  OrderType,
  RULE_NAME,
  type Options,
} from '../../../src/rules/attributes-order';

// Invalid options can't be expressed as `RuleTester` cases, so these
// tests run the rule through ESLint and check the configuration error.
function lintWithOptions(options: Options[number]) {
  return new Linter({ configType: 'flat' }).verify(
    '<div class="a" id="b"></div>',
    [
      {
        files: ['**/*.html'],
        languageOptions: {
          parser: require('@angular-eslint/template-parser'),
        },
        plugins: {
          template: { rules: { [RULE_NAME]: rule as never } },
        },
        rules: { [`template/${RULE_NAME}`]: ['error', options] },
      },
    ],
    'test.html',
  );
}

const orderWithDesignSystem = [
  OrderType.StructuralDirective,
  OrderType.TemplateReferenceVariable,
  'designSystem',
  OrderType.AttributeBinding,
  OrderType.InputBinding,
  OrderType.TwoWayBinding,
  OrderType.OutputBinding,
];

const designSystemGroup = {
  groupName: 'designSystem',
  attributeNamePattern: '^neo',
};

describe(`${RULE_NAME} options`, () => {
  it('accepts a custom group that is listed in order', () => {
    expect(
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem,
        customGroups: [designSystemGroup],
      }),
    ).toEqual([]);
  });

  it('rejects an order that is missing a built-in group', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem.filter(
          (entry) => entry !== OrderType.OutputBinding,
        ),
        customGroups: [designSystemGroup],
      }),
    ).toThrow(/`order` must include the built-in group "OUTPUT_BINDING"/);
  });

  it('rejects an order that lists a group more than once', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: [...orderWithDesignSystem, OrderType.InputBinding],
        customGroups: [designSystemGroup],
      }),
    ).toThrow(/should NOT have duplicate items/);
  });

  it('rejects a custom group named after a built-in group', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem,
        customGroups: [
          designSystemGroup,
          {
            groupName: OrderType.InputBinding,
            attributeNamePattern: '^neo',
          },
        ],
      }),
    ).toThrow(/Value "INPUT_BINDING" should NOT be valid/);
  });

  it('rejects an empty attributeNamePattern', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem,
        customGroups: [{ groupName: 'designSystem', attributeNamePattern: '' }],
      }),
    ).toThrow(/Value "" should NOT be shorter than 1 characters/);
  });

  it('rejects an invalid attributeNamePattern', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem,
        customGroups: [
          { groupName: 'designSystem', attributeNamePattern: '[' },
        ],
      }),
    ).toThrow(
      /the `attributeNamePattern` of the custom group "designSystem" is not a valid regular expression/,
    );
  });

  it('rejects a custom group that is not listed in order', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem.filter(
          (entry) => entry !== 'designSystem',
        ),
        customGroups: [designSystemGroup],
      }),
    ).toThrow(/the custom group "designSystem" must be listed in `order`/);
  });

  it('rejects an order entry that is not a built-in or custom group', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: [...orderWithDesignSystem, 'designSytem'],
        customGroups: [designSystemGroup],
      }),
    ).toThrow(
      /"designSytem" in `order` is neither a built-in group nor a `groupName` from `customGroups`/,
    );
  });

  it('rejects duplicate custom group names', () => {
    expect(() =>
      lintWithOptions({
        alphabetical: false,
        order: orderWithDesignSystem,
        customGroups: [
          designSystemGroup,
          { groupName: 'designSystem', attributeNamePattern: '^mat' },
        ],
      }),
    ).toThrow(
      /the custom group name "designSystem" is used more than once in `customGroups`/,
    );
  });
});
