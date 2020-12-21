import eslintPlugin from '../src';

const ESLINT_PLUGIN_PREFFIX = '@angular-eslint/';

interface Config {
  extends?: string | string[];
  rules?: { [ruleName: string]: string | object };
  overrides?: Config[];
}

function containsRule(config: any, ruleName: string): boolean {
  const prefixedRuleName = `${ESLINT_PLUGIN_PREFFIX}${ruleName}`;
  return (
    Boolean(config.rules?.[prefixedRuleName]) ||
    config.overrides?.some((config: Config) => config.rules?.[prefixedRuleName])
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
          .filter((ruleName) => ruleName.startsWith(ESLINT_PLUGIN_PREFFIX))
          .every((ruleName) =>
            Boolean(
              (eslintPlugin.rules as any)[
                ruleName.slice(ESLINT_PLUGIN_PREFFIX.length)
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
          .filter((ruleName) => ruleName.startsWith(ESLINT_PLUGIN_PREFFIX))
          .every((ruleName) =>
            Boolean(
              (eslintPlugin.rules as any)[
                ruleName.slice(ESLINT_PLUGIN_PREFFIX.length)
              ],
            ),
          ),
      ).toBe(true);
    });
  });
});
