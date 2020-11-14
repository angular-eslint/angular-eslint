import eslintPlugin from '../src';

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
      );
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
      );
    });
  });
});
