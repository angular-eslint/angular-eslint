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
function escapeRegexp(value: string) {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

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
 * @param specialChar The character to look for; in the above example that's ~.
 * @param otherChars All other characters which should be ignored. Used when asserting multiple
 *                   failures where there are multiple invalid characters.
 * @returns {{source: string, failure: {message: string, startPosition: null, endPosition: any}}}
 */
export function parseInvalidSource(
  source: string,
  specialChar = '~',
  otherChars: readonly string[] = [],
): { readonly failure: ExpectedFailure; readonly source: string } {
  let replacedSource: string;

  if (otherChars.length === 0) {
    replacedSource = source;
  } else {
    const patternAsStr = `[${otherChars.map(escapeRegexp).join('')}]`;
    const pattern = RegExp(patternAsStr, 'g');
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
    RegExp(escapeRegexp(specialChar), 'g'),
    '',
  );

  return {
    failure: {
      endPosition,
      message: '',
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      startPosition: startPosition!,
    },
    source: newSource,
  };
}

type BaseErrorOptions = {
  readonly description: string;
  readonly annotatedSource: string;
  readonly options?: readonly unknown[];
  readonly annotatedOutput?: string;
};

type Message<TMessageIds extends string> = {
  readonly messageId: TMessageIds;
  readonly data?: Record<string, unknown>;
  readonly suggestions?: TSESLint.SuggestionOutput<TMessageIds>[];
};

type SingleErrorOptions<TMessageIds extends string> = BaseErrorOptions &
  Message<TMessageIds>;

type MultipleErrorOptions<TMessageIds extends string> = BaseErrorOptions & {
  readonly messages: readonly (Message<TMessageIds> & {
    readonly char: string;
  })[];
};

export function convertAnnotatedSourceToFailureCase<TMessageIds extends string>(
  errorOptions: SingleErrorOptions<TMessageIds>,
): TSESLint.InvalidTestCase<TMessageIds, readonly unknown[]>;
export function convertAnnotatedSourceToFailureCase<TMessageIds extends string>(
  errorOptions: MultipleErrorOptions<TMessageIds>,
): TSESLint.InvalidTestCase<TMessageIds, readonly unknown[]>;
export function convertAnnotatedSourceToFailureCase<TMessageIds extends string>(
  errorOptions:
    | SingleErrorOptions<TMessageIds>
    | MultipleErrorOptions<TMessageIds>,
): TSESLint.InvalidTestCase<TMessageIds, readonly unknown[]> {
  const messages: MultipleErrorOptions<TMessageIds>['messages'] =
    'messageId' in errorOptions
      ? [{ ...errorOptions, char: '~' }]
      : errorOptions.messages;
  let parsedSource = '';
  const errors: TSESLint.TestCaseError<TMessageIds>[] = messages.map(
    ({ char: currentValueChar, data, messageId, suggestions }) => {
      const otherChars = messages
        .map(({ char }) => char)
        .filter((char) => char !== currentValueChar);
      const parsedForChar = parseInvalidSource(
        errorOptions.annotatedSource,
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

      return {
        data,
        messageId,
        line: startPosition.line + 1,
        column: startPosition.character + 1,
        endLine: endPosition.line + 1,
        endColumn: endPosition.character + 1,
        suggestions,
      };
    },
  );

  return {
    code: parsedSource,
    options: errorOptions.options ?? [],
    errors,
    output: errorOptions.annotatedOutput
      ? parseInvalidSource(errorOptions.annotatedOutput).source
      : null,
  };
}
