import { basename } from 'path';
import ts from 'typescript';

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

type PreprocessResult = (string | { text: string; filename: string })[];

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

    const classDeclarations = getClassDeclarationFromSourceFile(sourceFile);
    if (!classDeclarations || !classDeclarations.length) {
      return noopResult;
    }

    /**
     * Find all the Component decorators
     */
    const componentDecoratorNodes: ts.Decorator[] = [];
    for (const classDeclaration of classDeclarations) {
      const classDecorators = ts.getDecorators(classDeclaration);
      if (!classDecorators) {
        continue;
      }
      for (const decorator of classDecorators) {
        if (
          ts.isCallExpression(decorator.expression) &&
          ts.isIdentifier(decorator.expression.expression) &&
          decorator.expression.expression.text === 'Component'
        ) {
          componentDecoratorNodes.push(decorator);
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

      if (!ts.isPropertyAssignment(templateProperty)) {
        continue;
      }

      let templateText: string | undefined;

      const templatePropertyInitializer = templateProperty.initializer;
      if (ts.isNoSubstitutionTemplateLiteral(templatePropertyInitializer)) {
        templateText = templatePropertyInitializer.rawText;
      }

      if (ts.isTemplateExpression(templatePropertyInitializer)) {
        // The text includes the opening and closing
        // backtick, so trim the first and last characters.
        templateText = templatePropertyInitializer.getText().slice(1, -1);
      }

      if (ts.isStringLiteral(templatePropertyInitializer)) {
        templateText = templatePropertyInitializer.text;
      }

      // The template initializer is somehow not a string literal or a string template
      if (!templateText) {
        continue;
      }

      const baseFilename = basename(filename);
      const inlineTemplateTmpFilename = `inline-template-${baseFilename}-${++id}.component.html`;

      const start = templateProperty.initializer.getStart();
      const end = templateProperty.initializer.getEnd();

      rangeMap.set(inlineTemplateTmpFilename, {
        range: [start, end],
        lineAndCharacter: {
          start: sourceFile.getLineAndCharacterOfPosition(start),
          end: sourceFile.getLineAndCharacterOfPosition(end),
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

function getClassDeclarationFromSourceFile(
  sourceFile: ts.SourceFile,
): ts.ClassDeclaration[] {
  const classDeclarations: ts.ClassDeclaration[] = [];

  visit(sourceFile);

  return classDeclarations;

  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      classDeclarations.push(node);
      return;
    }

    // Class declarations are usually at the top-level, but there are
    // some situations where they might be nested, such as in test files.
    // If the node could have a class declaration somewhere in its
    // descendant nodes, then we will recurse down into each child node.

    // Keywords, tokens and trivia all come before `FirstNode`. They won't
    // contain child nodes anyway, but we can skip them to save some time.
    // Likewise, we can skip nodes that are part of JSDoc comments.
    if (
      node.kind < ts.SyntaxKind.FirstNode ||
      node.kind > ts.SyntaxKind.FirstJSDocNode
    ) {
      return;
    }

    // Type nodes can be skipped.
    if (
      node.kind >= ts.SyntaxKind.TypePredicate &&
      node.kind <= ts.SyntaxKind.ImportType
    ) {
      return;
    }

    // Some specific kinds of nodes can be skipped because
    // we know that they cannot contain class declarations.
    switch (node.kind) {
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.EnumDeclaration:
      case ts.SyntaxKind.ImportEqualsDeclaration:
      case ts.SyntaxKind.ImportDeclaration:
      case ts.SyntaxKind.ImportClause:
        return;
    }

    // For everything else, we'll play it safe
    // and recurse down into the child nodes.
    ts.forEachChild(node, visit);
  }
}

export function postprocessComponentFile(
  multiDimensionalMessages: {
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
    messageId: string;
    endLine: number;
    endColumn: number;
    fix?: {
      range: number[];
      text: string;
    };
  }[][],
  filename: string,
): readonly unknown[] {
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
    ...messagesFromAllInlineTemplateHTML.flatMap(
      (messagesFromInlineTemplateHTML, i) => {
        const baseFilename = basename(filename);
        const inlineTemplateTmpFilename = `inline-template-${baseFilename}-${++i}.component.html`;
        const rangeData = rangeMap.get(inlineTemplateTmpFilename);
        if (!rangeData) {
          return [];
        }

        return messagesFromInlineTemplateHTML.map((message) => {
          // The first line of the inline template starts at the column after
          // the opening quote in the TypeScript file, so we need to adjust
          // the message's column by that amount when the message starts on
          // the first line. The character we recorded was the quote's column,
          // so add one to get the column where the actual string starts.
          if (message.line === 1) {
            message.column += rangeData.lineAndCharacter.start.character + 1;
          }

          // The same thing applies to the end column
          // if it also ends on the first line.
          if (message.endLine === 1) {
            message.endColumn += rangeData.lineAndCharacter.start.character + 1;
          }

          message.line += rangeData.lineAndCharacter.start.line;
          message.endLine += rangeData.lineAndCharacter.start.line;

          if (message.fix) {
            // The range defines the range of the value that initializes
            // the `template` property, which includes the opening and
            // closing quotes. Add one to move past the opening quote.
            const startOffset = rangeData.range[0] + 1;
            message.fix.range = [
              startOffset + message.fix.range[0],
              startOffset + message.fix.range[1],
            ];
          }
          return message;
        });
      },
    ),
  ];
  return res;
}

export default {
  'extract-inline-html': {
    meta: {
      name: 'extract-inline-html',
    },
    preprocess: preprocessComponentFile,
    postprocess: postprocessComponentFile,
    supportsAutofix: true,
  },
};
