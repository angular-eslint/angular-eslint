import ts from 'typescript';

function quickExtractComponentDecorator(text: string) {
  const matches = text.match(/@Component\({(\s.*\s)*}\)/);
  if (!matches || !matches.length) {
    return null;
  }
  return matches[0];
}

function quickStripComponentDecoratorFromMetadata(
  componentDecoratorMatch: string,
): string {
  return componentDecoratorMatch
    .slice(0, componentDecoratorMatch.length - 1)
    .replace('@Component(', '');
}

function quickGetRangeForTemplate(text: string, template: string) {
  const start = text.indexOf(template);
  return [start, start + template.length];
}

const rangeMap = new Map();

export function preprocessComponentFile(text: string, filename: string) {
  if (!filename.endsWith('.component.ts')) {
    return [text];
  }
  /**
   * Ignore malformed Component files
   */
  const componentDecoratorMatch = quickExtractComponentDecorator(text);
  if (!componentDecoratorMatch) {
    return [text];
  }
  /**
   * Ignore Components which have external template files, they will be linted directly
   */
  if (
    componentDecoratorMatch.includes('templateUrl') ||
    !componentDecoratorMatch.includes('template')
  ) {
    return [text];
  }

  try {
    const metadataText = quickStripComponentDecoratorFromMetadata(
      componentDecoratorMatch,
    );
    const metadata: any = metadataText
      .split(',')
      .map(x => x.split(':').map(y => y.trim()))
      .reduce((a: any, x) => {
        a[x[0]] = x[1];
        return a;
      }, {});

    const range = quickGetRangeForTemplate(text, metadata.template);

    const sourceFile = ts.createSourceFile(
      filename,
      text,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ false,
    );

    rangeMap.set(filename, {
      range,
      lineAndCharacter: {
        start: sourceFile.getLineAndCharacterOfPosition(range[0]),
        end: sourceFile.getLineAndCharacterOfPosition(range[1]),
      },
    });
    /**
     * We return an array containing both the original source, and a new fragment
     * representing the inline HTML template. It must have an appropriate .html
     * extension so that it can be linted using the right rules and plugins.
     *
     * The postprocessor will handle tying things back to the right position
     * in the original file, so this temporary filename will never be visible
     * to the end user.
     */
    return [
      text,
      {
        text: metadata.template,
        filename: 'inline-template.component.html',
      },
    ];
  } catch (err) {
    console.log(err);
    console.error(
      'preprocess: ERROR could not parse @Component() metadata',
      filename,
    );
    return [text];
  }
}

export function postprocessComponentFile(
  multiDimensionalMessages: any[][],
  filename: string,
) {
  const messagesFromComponentSource = multiDimensionalMessages[0];
  const messagesFromInlineTemplateHTML = multiDimensionalMessages[1];
  /**
   * If the Component did not have an inline template the second item
   * in the multiDimensionalMessages will not exist
   */
  if (
    !messagesFromInlineTemplateHTML ||
    !messagesFromInlineTemplateHTML.length
  ) {
    return messagesFromComponentSource;
  }
  const rangeData = rangeMap.get(filename);
  if (!rangeData) {
    return messagesFromComponentSource;
  }
  /**
   * Adjust message location data to apply it back to the
   * original file
   */
  return [
    ...messagesFromComponentSource,
    ...messagesFromInlineTemplateHTML.map(
      (message: {
        line: string | number;
        column: any;
        endLine: string | number;
        endColumn: any;
        fix: { range: [number, number]; text: string };
      }) => {
        message.line = message.line + rangeData.lineAndCharacter.start.line;
        message.column = message.column;

        message.endLine =
          message.endLine + rangeData.lineAndCharacter.start.line;
        message.endColumn = message.endColumn;

        const startOffset = rangeData.range[0];
        message.fix.range = [
          startOffset + message.fix.range[0],
          startOffset + message.fix.range[1],
        ];
        return message;
      },
    ),
  ];
}

export default {
  'extract-inline-html': {
    preprocess: preprocessComponentFile,
    postprocess: postprocessComponentFile,
    supportsAutofix: true,
  },
};
