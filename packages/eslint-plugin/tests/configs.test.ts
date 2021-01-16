import eslintPlugin from '../src';

const ESLINT_PLUGIN_PREFIX = '@angular-eslint/';

interface Config {
  extends?: string | string[];
  rules?: { [ruleName: string]: string | unknown };
  overrides?: Config[];
}

function containsRule(config: Config, ruleName: string): boolean {
  const prefixedRuleName = `${ESLINT_PLUGIN_PREFIX}${ruleName}`;
  return Boolean(
    config.rules?.[prefixedRuleName] ||
      config.overrides?.some(({ rules }) => rules?.[prefixedRuleName]),
  );
}

describe('configs', () => {
  describe('base', () => {
    it('exists', () => {
      expect(eslintPlugin.configs.base).toBeDefined();
    });
  });

  describe('ng-cli-compat', () => {
    it('exists', () => {
      expect(eslintPlugin.configs['ng-cli-compat']).toBeDefined();
    });
  });

  describe('ng-cli-compat--formatting-add-on', () => {
    it('exists', () => {
      expect(
        eslintPlugin.configs['ng-cli-compat--formatting-add-on'],
      ).toBeDefined();
    });
  });

  describe('all', () => {
    it('should contain all of the rules from the plugin', () => {
      expect(
        Object.keys(eslintPlugin.rules).every((ruleName) =>
          containsRule(eslintPlugin.configs.all, ruleName),
        ),
      ).toBe(true);
    });

    it('should only contain valid rules', () => {
      expect(
        Object.keys(eslintPlugin.configs.all.rules)
          .filter((ruleName) => ruleName.startsWith(ESLINT_PLUGIN_PREFIX))
          .every((ruleName) =>
            Boolean(
              eslintPlugin.rules[
                ruleName.slice(
                  ESLINT_PLUGIN_PREFIX.length,
                ) as keyof typeof eslintPlugin.rules
              ],
            ),
          ),
      ).toBe(true);
    });
  });

  describe('recommended', () => {
    it('should contain the recommended rules', () => {
      expect(
        Object.entries(eslintPlugin.rules)
          .filter((entry) => !!entry[1].meta.docs?.recommended)
          .every((entry) =>
            containsRule(eslintPlugin.configs.recommended, entry[0]),
          ),
      ).toBe(true);
    });

    it('should only contain valid rules', () => {
      expect(
        Object.keys(eslintPlugin.configs.recommended.rules)
          .filter((ruleName) => ruleName.startsWith(ESLINT_PLUGIN_PREFIX))
          .every((ruleName) =>
            Boolean(
              eslintPlugin.rules[
                ruleName.slice(
                  ESLINT_PLUGIN_PREFIX.length,
                ) as keyof typeof eslintPlugin.rules
              ],
            ),
          ),
      ).toBe(true);
    });
  });
});
