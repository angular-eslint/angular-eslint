import ts from 'typescript';

function quickGetRangeForTemplate(text: string, template: string) {
  const start = text.indexOf(template);
  return [start, start + template.length];
}

const rangeMap = new Map();

const multipleComponentsPerFileError =
  '@angular-eslint/eslint-plugin-template currently only supports 1 Component per file';

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

export function preprocessComponentFile(
  text: string,
  filename: string,
): Array<string | { text: string; filename: string }> {
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

    /**
     * Only support one component per file for now...
     * I don't know if people actually use multiple components per file in practice
     * and I think it makes sense to wait until people complain about this before
     * attempting to figure out support for it (rather than having something half-baked)
     */
    if (componentDecoratorNodes.length > 1) {
      throw new Error(multipleComponentsPerFileError);
    }

    const componentDecoratorNode = componentDecoratorNodes[0];
    /**
     * Ignore malformed component metadata
     */
    if (
      !ts.isDecorator(componentDecoratorNode) ||
      !ts.isCallExpression(componentDecoratorNode.expression) ||
      componentDecoratorNode.expression.arguments.length !== 1
    ) {
      return noopResult;
    }

    const metadata = componentDecoratorNode.expression.arguments[0];
    if (!ts.isObjectLiteralExpression(metadata)) {
      return noopResult;
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
      return noopResult;
    }

    if (
      !ts.isPropertyAssignment(templateProperty) ||
      !ts.isStringLiteralLike(templateProperty.initializer)
    ) {
      return noopResult;
    }

    const templateText = templateProperty.initializer.text;

    const range = quickGetRangeForTemplate(text, templateText);

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
        text: templateText,
        filename: 'inline-template.component.html',
      },
    ];
  } catch (err) {
    // Rethrow known error
    if (err.message === multipleComponentsPerFileError) {
      throw err;
    }
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
  filename: string,
): any[] {
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
        fix?: { range: [number, number]; text: string };
      }) => {
        message.line = message.line + rangeData.lineAndCharacter.start.line;
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
