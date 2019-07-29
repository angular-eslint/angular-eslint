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
  // remove @Component()
  return componentDecoratorMatch
    .slice(0, componentDecoratorMatch.length - 1)
    .replace('@Component(', '');
}

function quickGetRangeForTemplate(text: string, template: string) {
  const start = text.indexOf(template);
  return [start, start + template.length];
}

const rangeMap = new Map();

export function preprocessTSFile(text: string, filename: string) {
  if (!filename.endsWith('.component.ts')) {
    // console.log("preprocess: Ignoring non-component source file", filename);
    return [''];
  }

  /**
   * Ignore malformed Component files
   */
  const componentDecoratorMatch = quickExtractComponentDecorator(text);
  if (!componentDecoratorMatch) {
    // console.log(
    //   "preprocess: Ignoring component with no detectable @Component() decorator",
    //   filename
    // );
    return [''];
  }
  /**
   * Ignore Components which have external template files, they will be linted directly
   */
  if (componentDecoratorMatch.includes('templateUrl')) {
    // console.log(
    //   "preprocess: Ignoring component with external template",
    //   filename
    // );
    return [''];
  }

  if (!componentDecoratorMatch.includes('template')) {
    // console.log(
    //   "preprocess: Ignoring component with neither inline nor external template",
    //   filename
    // );
    return [''];
  }

  //   console.log(
  //     "preprocess: Extracting inline template for Component file",
  //     filename
  //   );
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

    // console.log(
    //   "preprocess: creating TS SourceFile for Component file",
    //   filename
    // );
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

    return [metadata.template]; // return an array of strings to lint
  } catch (err) {
    console.log(err);
    console.error(
      'preprocess: ERROR could not parse @Component() metadata',
      filename,
    );
    return [''];
  }
}

export function postprocessTSFile(
  multiDimensionalMessages: any[][],
  filename: string,
) {
  const messages = multiDimensionalMessages[0];
  if (!messages.length) {
    return messages;
  }
  const rangeData = rangeMap.get(filename);
  if (!rangeData) {
    return messages;
  }
  //   console.log("postprocess: Found original range data", rangeData, messages);

  // adjust message location data
  return messages.map(
    (message: {
      line: string | number;
      column: any;
      endLine: string | number;
      endColumn: any;
      fix: { range: [number, number]; text: string };
    }) => {
      //   console.log("message before", message);
      message.line = message.line + rangeData.lineAndCharacter.start.line;
      message.column = message.column;

      message.endLine = message.endLine + rangeData.lineAndCharacter.start.line;
      message.endColumn = message.endColumn;

      const startOffset = rangeData.range[0];
      message.fix.range = [
        startOffset + message.fix.range[0],
        startOffset + message.fix.range[1],
      ];
      //   console.log(message);
      return message;
    },
  );
}

export default {
  '.ts': {
    preprocess: preprocessTSFile,
    postprocess: postprocessTSFile,
    supportsAutofix: true,
  },
};
