import type { TSESLint } from '@typescript-eslint/experimental-utils';

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
  readonly endPosition?: SourcePosition;
  readonly message: string;
  readonly startPosition?: SourcePosition;
}

/**
 * FROM CODELYZER
 */
const escapeRegexp = (value: string): string =>
  value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

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
  let startPosition: SourcePosition | undefined;

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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      startPosition: startPosition!,
    },
    source: newSource,
  };
};

export function convertAnnotatedSourceToFailureCase<T extends string>({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  description: _,
  /* eslint-enable @typescript-eslint/no-unused-vars */
  annotatedSource,
  messageId,
  messages = [],
  data,
  options = [],
  annotatedOutput,
  suggestions,
}: {
  description: string;
  annotatedSource: string;
  messageId?: T;
  messages?: { char: string; messageId: T }[];
  data?: Record<string, unknown>;
  options?: readonly unknown[];
  annotatedOutput?: string;
  suggestions?: TSESLint.SuggestionOutput<T>[];
}): TSESLint.InvalidTestCase<T, readonly unknown[]> {
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
  const errors: TSESLint.TestCaseError<T>[] = messages.map(
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
      const {
        failure: { endPosition, startPosition },
      } = parsedForChar;
      parsedSource = parsedForChar.source;

      if (!endPosition || !startPosition) {
        throw Error(
          `Char '${currentValueChar}' has been specified in \`messages\`, however it is not present in the source of the failure case`,
        );
      }

      const error: TSESLint.TestCaseError<T> = {
        messageId,
        line: startPosition.line + 1,
        column: startPosition.character + 1,
        endLine: endPosition.line + 1,
        endColumn: endPosition.character + 1,
        suggestions,
      };

      if (data) {
        // TODO: Make .data writable in @typescript-eslint/experimental-utils types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).data = data;
      }

      return error;
    },
  );

  const invalidTestCase: TSESLint.InvalidTestCase<T, readonly unknown[]> = {
    code: parsedSource,
    options,
    errors,
  };
  if (annotatedOutput) {
    // TODO: Make .output writable in @typescript-eslint/experimental-utils types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (invalidTestCase as any).output = parseInvalidSource(
      annotatedOutput,
      '',
    ).source;
  }
  return invalidTestCase;
}
