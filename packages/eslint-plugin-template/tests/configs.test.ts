import eslintPluginTemplate from '../src';

const ESLINT_PLUGIN_PREFFIX = '@angular-eslint/template/';

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
      expect(eslintPluginTemplate.configs.base).toBeDefined();
    });
  });

  describe('all', () => {
    it('should contain all of the rules from the plugin', () => {
      expect(
        Object.keys(eslintPluginTemplate.rules).every((ruleName) =>
          containsRule(eslintPluginTemplate.configs.all, ruleName),
        ),
      ).toBe(true);
    });

    it('should only contain valid rules', () => {
      expect(
        Object.keys(eslintPluginTemplate.configs.all.rules)
          .filter((ruleName) => ruleName.startsWith(ESLINT_PLUGIN_PREFFIX))
          .every((ruleName) =>
            Boolean(
              (eslintPluginTemplate.rules as any)[
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
        Object.entries(eslintPluginTemplate.rules)
          .filter((entry) => !!entry[1].meta.docs?.recommended)
          .every((entry) =>
            containsRule(eslintPluginTemplate.configs.recommended, entry[0]),
          ),
      ).toBe(true);
    });

    it('should only contain valid rules', () => {
      expect(
        Object.keys(eslintPluginTemplate.configs.recommended.rules)
          .filter((ruleName) => ruleName.startsWith(ESLINT_PLUGIN_PREFFIX))
          .every((ruleName) =>
            Boolean(
              (eslintPluginTemplate.rules as any)[
                ruleName.slice(ESLINT_PLUGIN_PREFFIX.length)
              ],
            ),
          ),
      ).toBe(true);
    });
  });
});
