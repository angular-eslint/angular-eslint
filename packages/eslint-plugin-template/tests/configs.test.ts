import eslintPluginTemplate from '../src';

interface Config {
  extends?: string | string[];
  rules?: { [ruleName: string]: string | object };
  overrides?: Config[];
}

function containsRule(config: any, ruleName: string): boolean {
  return (
    Boolean(config.rules?.[ruleName]) ||
    config.overrides?.some((config: Config) => config.rules?.[ruleName])
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
      );
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
      );
    });
  });
});
