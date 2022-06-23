import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

const VALID_PARSERS = [
  '@angular-eslint/template-parser',
  '@typescript-eslint/parser',
] as const;

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof VALID_PARSERS[number];
};

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

function isValidParser(
  parser?: string,
): parser is typeof VALID_PARSERS[number] {
  return VALID_PARSERS.includes(parser as typeof VALID_PARSERS[number]);
}

export class RuleTester extends TSESLint.RuleTester {
  private filename?: string;

  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    });

    if (options.parserOptions?.project) {
      this.filename = path.join(getFixturesRootDir(), 'file.ts');
    }

    // make sure that the parser doesn't hold onto file handles between tests
    // on linux (i.e. our CI env), there can be very a limited number of watch handles available
    afterAll(() => {
      try {
        // instead of creating a hard dependency, just use a soft require
        // a bit weird, but if they're using this tooling, it'll be installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require(options.parser).clearCaches();
      } catch {
        // ignored
      }
    });
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends readonly unknown[]>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    { valid, invalid }: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${VALID_PARSERS.join(
      ', ',
    )}`;
    const parsedTests = {
      valid: valid.map((test) => {
        if (typeof test !== 'string' && isValidParser(test.parser)) {
          throw Error(errorMessage);
        }
        return {
          ...(typeof test === 'string' ? { code: test } : test),
          filename: this.filename,
        };
      }),
      invalid: invalid.map((test) => {
        if (isValidParser(test.parser)) {
          throw Error(errorMessage);
        }
        return {
          ...test,
          filename: this.filename,
        };
      }),
    };

    super.run(name, rule, parsedTests);
  }
}
