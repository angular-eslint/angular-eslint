import type {
  RunTests,
  RuleTesterConfig,
} from '@typescript-eslint/rule-tester';
import { RuleTester as TSESLintRuleTester } from '@typescript-eslint/rule-tester';
import type { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

const VALID_PARSERS = [
  '@angular-eslint/template-parser',
  '@typescript-eslint/parser',
] as const;

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

function isValidParser(
  parser: Readonly<TSESLint.Parser.LooseParserModule>,
): boolean {
  if (parser === require('@angular-eslint/template-parser')) {
    return true;
  }
  if (parser === require('@typescript-eslint/parser')) {
    return true;
  }
  return false;
}

export class RuleTester extends TSESLintRuleTester {
  private filename?: string = '';

  constructor(options?: RuleTesterConfig) {
    super(options);

    if (options?.languageOptions?.parserOptions?.project) {
      this.filename = path.join(
        options?.languageOptions.parserOptions.tsconfigRootDir ??
          getFixturesRootDir(),
        'file.ts',
      );
    }
  }

  override run<MessageIds extends string, Options extends readonly unknown[]>(
    ruleName: string,
    rule: TSESLint.RuleModule<MessageIds, Options>,
    { valid, invalid }: RunTests<MessageIds, Options>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${VALID_PARSERS.join(
      ', ',
    )}`;
    const parsedTests = {
      valid: valid.map((test) => {
        if (
          typeof test !== 'string' &&
          test.languageOptions?.parser &&
          !isValidParser(test.languageOptions.parser)
        ) {
          throw Error(errorMessage);
        }
        return typeof test === 'string'
          ? { code: test, filename: this.filename }
          : { ...test, filename: test.filename ?? this.filename };
      }),
      invalid: invalid.map((test) => {
        if (
          test.languageOptions?.parser &&
          !isValidParser(test.languageOptions.parser)
        ) {
          throw Error(errorMessage);
        }
        return {
          ...test,
          filename: test.filename ?? this.filename,
        };
      }),
    };

    super.run(ruleName, rule, parsedTests);
  }
}
