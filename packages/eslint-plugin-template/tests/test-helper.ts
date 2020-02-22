import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as path from 'path';

const parser = '@angular-eslint/template-parser';

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
};

/**
 * TODO: expose properly from @typescript-eslint/experimental-utils
 */
import {
  TestCaseError,
  InvalidTestCase,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export class RuleTester extends TSESLint.RuleTester {
  private filename: string | undefined = undefined;

  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    });

    if (options.parserOptions && options.parserOptions.project) {
      this.filename = path.join(getFixturesRootDir(), 'file.ts');
    }
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;

    if (this.filename) {
      tests.valid = tests.valid.map(test => {
        if (typeof test === 'string') {
          return {
            code: test,
            filename: this.filename,
          };
        }
        return test;
      });
    }

    tests.valid.forEach(test => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
        if (!test.filename) {
          test.filename = this.filename;
        }
      }
    });
    tests.invalid.forEach(test => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
      if (!test.filename) {
        test.filename = this.filename;
      }
    });

    super.run(name, rule, tests);
  }
}

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

export function convertAnnotatedSourceToFailureCase<T extends string>({
  // @ts-ignore
  description: _,
  annotatedSource,
  messageId,
  messages = [],
  data,
  options = [],
  annotatedOutput,
}: {
  description: string;
  annotatedSource: string;
  messageId?: T;
  messages?: { char: string; messageId: T }[];
  data?: Record<string, any>;
  options?: any;
  annotatedOutput?: string;
}): InvalidTestCase<T, typeof options> {
  if (!messageId && (!messages || !messages.length)) {
    throw new Error(
      'Either `messageId` or `messages` is required when configuring a failure case',
    );
  }

  if (messageId) {
    messages = [
      {
        char: '~',
        messageId,
      },
    ];
  }

  let parsedSource = '';

  const errors: TestCaseError<T>[] = messages.map(
    ({ char: currentValueChar, messageId }) => {
      const otherChars = messages
        .filter(({ char }) => char !== currentValueChar)
        .map(({ char }) => char);

      const parsedForChar = parseInvalidSource(
        annotatedSource,
        '',
        currentValueChar,
        otherChars,
      );
      parsedSource = parsedForChar.source;

      const error: TestCaseError<T> = {
        messageId,
        line: parsedForChar.failure.startPosition.line + 1,
        column: parsedForChar.failure.startPosition.character + 1,
        endLine: parsedForChar.failure.endPosition.line + 1,
        endColumn: parsedForChar.failure.endPosition.character + 1,
      };

      if (data) {
        error.data = data;
      }

      return error;
    },
  );

  const invalidTestCase: InvalidTestCase<T, typeof options> = {
    code: parsedSource,
    options,
    errors,
  };
  if (annotatedOutput) {
    invalidTestCase.output = parseInvalidSource(annotatedOutput, '').source;
  }
  return invalidTestCase;
}

/**
 * FROM CODELYZER
 */
interface SourcePosition {
  readonly character: number;
  readonly line: number;
}

/**
 * FROM CODELYZER
 */
interface ExpectedFailure {
  readonly endPosition: SourcePosition;
  readonly message: string;
  readonly startPosition: SourcePosition;
}

/**
 * FROM CODELYZER
 */
const escapeRegexp = (value: string): string =>
  value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * FROM CODELYZER
 *
 * When testing a failure, we also test to see if the linter will report the correct place where
 * the source code doesn't match the rule.
 *
 * For example, if you use a private property in your template, the linter should report _where_
 * did it happen. Because it's tedious to supply actual line/column number in the spec, we use
 * some custom syntax with "underlining" the problematic part with tildes:
 *
 * ```
 * template: '{{ foo }}'
 *               ~~~
 * ```
 *
 * When giving a spec which we expect to fail, we give it "source code" such as above, with tildes.
 * We call this kind of source code "annotated". This source code cannot be compiled (and thus
 * cannot be linted/tested), so we use this function to get rid of tildes, but maintain the
 * information about where the linter is supposed to catch error.
 *
 * The result of the function contains "cleaned" source (`.source`) and a `.failure` object which
 * contains the `.startPosition` and `.endPosition` of the tildes.
 *
 * @param source The annotated source code with tildes.
 * @param message Passed to the result's `.failure.message` property.
 * @param specialChar The character to look for; in the above example that's ~.
 * @param otherChars All other characters which should be ignored. Used when asserting multiple
 *                   failures where there are multiple invalid characters.
 * @returns {{source: string, failure: {message: string, startPosition: null, endPosition: any}}}
 */
export const parseInvalidSource = (
  source: string,
  message: string,
  specialChar = '~',
  otherChars: string[] = [],
): { failure: ExpectedFailure; source: string } => {
  let replacedSource: string;

  if (otherChars.length === 0) {
    replacedSource = source;
  } else {
    const patternAsStr = `[${otherChars.map(escapeRegexp).join('')}]`;
    const pattern = new RegExp(patternAsStr, 'g');

    replacedSource = source.replace(pattern, ' ');
  }

  let col = 0;
  let line = 0;
  let lastCol = 0;
  let lastLine = 0;
  let startPosition: any;

  for (const currentChar of replacedSource) {
    if (currentChar === '\n') {
      col = 0;
      line++;

      continue;
    }

    col++;

    if (currentChar !== specialChar) continue;

    if (!startPosition) {
      startPosition = {
        character: col - 1,
        line: line - 1,
      };
    }

    lastCol = col;
    lastLine = line - 1;
  }

  const endPosition: SourcePosition = {
    character: lastCol,
    line: lastLine,
  };
  const newSource = replacedSource.replace(
    new RegExp(escapeRegexp(specialChar), 'g'),
    '',
  );

  return {
    failure: {
      endPosition,
      message,
      startPosition: startPosition!,
    },
    source: newSource,
  };
};
