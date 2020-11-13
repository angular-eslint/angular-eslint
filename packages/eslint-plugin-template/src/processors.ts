import ts from 'typescript';

function quickGetRangeForTemplate(text: string, template: string) {
  const start = text.indexOf(template);
  return [start, start + template.length];
}

const rangeMap = new Map();

/**
 * Because ultimately a user is in control of how and when this processor gets invoked,
 * we can't fully protect them against doing more work than is necessary in all cases.
 *
 * Therefore, before we do a full parse of a TypeScript file to try and extract one or
 * more Component declarations we want to do a really quick check for whether or not
 * a file is likely to contain them.
 */
export function isFileLikelyToContainComponentDeclarations(
  text: string,
  filename: string,
): boolean {
  /**
   * Quickest possible heuristic is based on file extension suffix
   */
  if (
    [
      '.component.ts',
      '.page.ts',
      '.dialog.ts',
      '.modal.ts',
      '.popover.ts',
      '.bottomsheet.ts',
      '.snackbar.ts',
    ].some((likelySuffix) => filename.endsWith(likelySuffix))
  ) {
    return true;
  }

  /**
   * Next quickest possible heuristic is the presence of the substring 'Component'
   * and the substring '@angular/core' within the file contents
   */
  if (text.includes('Component') && text.includes('@angular/core')) {
    return true;
  }

  return false;
}

type PreprocessResult = Array<string | { text: string; filename: string }>;

export function preprocessComponentFile(
  text: string,
  filename: string,
): PreprocessResult {
  // This effectively instructs ESLint that there were no code blocks to extract for the current file
  const noopResult = [text];

  if (!isFileLikelyToContainComponentDeclarations(text, filename)) {
    return noopResult;
  }

  try {
    const sourceFile = ts.createSourceFile(
      filename,
      text,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
    );

    const classDeclarations = sourceFile.statements.filter((s) =>
      ts.isClassDeclaration(s),
    );
    if (!classDeclarations || !classDeclarations.length) {
      return noopResult;
    }

    /**
     * Find all the Component decorators
     */
    const componentDecoratorNodes: ts.Decorator[] = [];
    for (const classDeclaration of classDeclarations) {
      if (classDeclaration.decorators) {
        for (const decorator of classDeclaration.decorators) {
          if (
            ts.isCallExpression(decorator.expression) &&
            ts.isIdentifier(decorator.expression.expression) &&
            decorator.expression.expression.text === 'Component'
          ) {
            componentDecoratorNodes.push(decorator);
          }
        }
      }
    }

    /**
     * Ignore malformed Component files
     */
    if (!componentDecoratorNodes || !componentDecoratorNodes.length) {
      return noopResult;
    }

    const result: PreprocessResult = [text];

    let id = 0;
    for (const componentDecoratorNode of componentDecoratorNodes) {
      /**
       * Ignore malformed component metadata
       */
      if (
        !ts.isDecorator(componentDecoratorNode) ||
        !ts.isCallExpression(componentDecoratorNode.expression) ||
        componentDecoratorNode.expression.arguments.length !== 1
      ) {
        continue;
      }

      const metadata = componentDecoratorNode.expression.arguments[0];
      if (!ts.isObjectLiteralExpression(metadata)) {
        continue;
      }

      /**
       * Ignore Components which have external template files, they will be linted directly,
       * and any that have inline templates which are malformed
       */
      const templateProperty = metadata.properties.find(
        (id) => id && id.name && id.name.getText() === 'template',
      );
      if (
        metadata.properties.find(
          (id) => id && id.name && id.name.getText() === 'templateUrl',
        ) ||
        !templateProperty
      ) {
        continue;
      }

      if (
        !ts.isPropertyAssignment(templateProperty) ||
        !ts.isStringLiteralLike(templateProperty.initializer)
      ) {
        continue;
      }

      const templateText = templateProperty.initializer.text;

      const range = quickGetRangeForTemplate(text, templateText);

      const inlineTemplateTmpFilename = `inline-template-${++id}.component.html`;

      rangeMap.set(inlineTemplateTmpFilename, {
        range,
        lineAndCharacter: {
          start: sourceFile.getLineAndCharacterOfPosition(range[0]),
          end: sourceFile.getLineAndCharacterOfPosition(range[1]),
        },
      });

      /**
       * We are ultimately returning an array containing both the original source,
       * and a new fragment representing each of the inline HTML templates found.
       * Each fragment must have an appropriate .html extension so that it can be
       * linted using the right rules and plugins.
       *
       * The postprocessor will handle tying things back to the right position
       * in the original file, so this temporary filename will never be visible
       * to the end user.
       */
      result.push({
        text: templateText,
        filename: inlineTemplateTmpFilename,
      });
    }

    return result;
  } catch (err) {
    console.log(err);
    console.error(
      'preprocess: ERROR could not parse @Component() metadata',
      filename,
    );
    return noopResult;
  }
}

export function postprocessComponentFile(
  multiDimensionalMessages: any[][],
  _filename: string,
): any[] {
  const messagesFromComponentSource = multiDimensionalMessages[0];
  /**
   * If the Component did not have one or more inline templates defined within it
   * there will only be one item in the multiDimensionalMessages
   */
  if (multiDimensionalMessages.length === 1) {
    return messagesFromComponentSource;
  }

  /**
   * There could be multiple inline templates found within the current file,
   * so they are represented by all of the multiDimensionalMessages after the
   * first one (which is the file itself)
   */
  const messagesFromAllInlineTemplateHTML = multiDimensionalMessages.slice(1);

  /**
   * Adjust message location data to apply it back to the
   * original file
   */
  const res = [
    ...messagesFromComponentSource,

    // Ah, multi-dimensional arrays without .flat() ...
    ...([] as any[]).concat(
      ...messagesFromAllInlineTemplateHTML.map(
        (messagesFromInlineTemplateHTML, i) => {
          const inlineTemplateTmpFilename = `inline-template-${++i}.component.html`;
          const rangeData = rangeMap.get(inlineTemplateTmpFilename);
          if (!rangeData) {
            return [];
          }

          return messagesFromInlineTemplateHTML.map(
            (message: {
              line: string | number;
              column: any;
              endLine: string | number;
              endColumn: any;
              fix?: { range: [number, number]; text: string };
            }) => {
              message.line =
                message.line + rangeData.lineAndCharacter.start.line;
              message.column = message.column;

              message.endLine =
                message.endLine + rangeData.lineAndCharacter.start.line;
              message.endColumn = message.endColumn;

              if (message.fix) {
                const startOffset = rangeData.range[0];
                message.fix.range = [
                  startOffset + message.fix.range[0],
                  startOffset + message.fix.range[1],
                ];
              }
              return message;
            },
          );
        },
      ),
    ),
  ];
  return res;
}

export default {
  'extract-inline-html': {
    preprocess: preprocessComponentFile,
    postprocess: postprocessComponentFile,
    supportsAutofix: true,
  },
};
