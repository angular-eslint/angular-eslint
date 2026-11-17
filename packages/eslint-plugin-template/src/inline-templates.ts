import { basename } from 'path';
import ts from 'typescript';
import {
  createTextSource,
  decodeLiteral,
  escapeStringLiteralText,
  scanStringLiteral,
  type TextSource,
} from './literal-text';

/**
 * A template written as a single- or double-quoted string literal. Its decoded
 * value is what gets linted, so offsets in the linted text have to be mapped
 * through the escape sequences back to the TypeScript source.
 */
interface StringLiteralTemplate {
  quote: string;
  /** The decoded value of the literal, which is the linted template */
  text: string;
  /** The source text between the quotes */
  raw: string;
  /** Source file offset for every offset into `text`, see `decodeLiteral()` */
  offsets: number[];
  /** The linted template, for converting reported positions to offsets */
  virtualSource: TextSource;
  /** The whole TypeScript file, for converting offsets to reported positions */
  source: TextSource;
}

interface RangeData {
  sourceFilename: string;
  range: [number, number];
  lineAndCharacter: {
    start: ts.LineAndCharacter;
    end: ts.LineAndCharacter;
  };
  /** Set for string literal templates; template literals are linted raw */
  stringLiteral?: StringLiteralTemplate;
}

const rangeMap = new Map<string, RangeData>();

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

export type PreprocessResult = (string | { text: string; filename: string })[];

export function preprocessComponentFile(
  text: string,
  filename: string,
  /** Lets callers that already parsed the file avoid a second full parse */
  parsedSourceFile?: ts.SourceFile,
): PreprocessResult {
  // This effectively instructs ESLint that there were no code blocks to extract for the current file
  const noopResult = [text];

  if (!isFileLikelyToContainComponentDeclarations(text, filename)) {
    return noopResult;
  }

  try {
    const sourceFile =
      parsedSourceFile ??
      ts.createSourceFile(
        filename,
        text,
        ts.ScriptTarget.Latest,
        /* setParentNodes */ true,
      );

    const result: PreprocessResult = [text];

    let source: TextSource | undefined;
    let id = 0;
    for (const metadata of getComponentMetadata(sourceFile)) {
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
      let stringLiteral: StringLiteralTemplate | undefined;

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
        const decoded = decodeLiteral(templatePropertyInitializer, sourceFile);
        // Without a reliable mapping, reports and fixes would land in the wrong place
        if (!decoded) {
          continue;
        }
        templateText = decoded.text;
        stringLiteral = {
          ...decoded,
          raw: text.slice(
            decoded.offsets[0],
            templatePropertyInitializer.getEnd() - 1,
          ),
          virtualSource: createTextSource(decoded.text),
          source: (source ??= createTextSource(text)),
        };
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
        sourceFilename: filename,
        range: [start, end],
        lineAndCharacter: {
          start: sourceFile.getLineAndCharacterOfPosition(start),
          end: sourceFile.getLineAndCharacterOfPosition(end),
        },
        stringLiteral,
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

export function getComponentMetadata(
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression[] {
  const metadata: ts.ObjectLiteralExpression[] = [];
  for (const declaration of getClassDeclarationFromSourceFile(sourceFile)) {
    for (const decorator of ts.getDecorators(declaration) ?? []) {
      const expression = decorator.expression;
      if (
        ts.isCallExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        expression.expression.text === 'Component' &&
        expression.arguments.length === 1 &&
        ts.isObjectLiteralExpression(expression.arguments[0])
      ) {
        metadata.push(expression.arguments[0]);
      }
    }
  }
  return metadata;
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

interface TextEdit {
  range: number[];
  text: string;
}

interface InlineTemplateMessage {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId: string;
  // Absent on some messages, such as fatal parsing errors
  endLine?: number;
  endColumn?: number;
  fix?: TextEdit;
  suggestions?: {
    fix: TextEdit;
    [key: string]: unknown;
  }[];
  [key: string]: unknown;
}

export function postprocessComponentFile(
  multiDimensionalMessages: InlineTemplateMessage[][],
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
        const inlineTemplateTmpFilename = `inline-template-${baseFilename}-${i + 1}.component.html`;
        const rangeData = rangeMap.get(inlineTemplateTmpFilename);
        if (!rangeData) {
          return [];
        }

        const { stringLiteral } = rangeData;
        return messagesFromInlineTemplateHTML.map((message) =>
          stringLiteral
            ? mapStringLiteralTemplateMessage(message, stringLiteral)
            : mapTemplateLiteralMessage(message, rangeData),
        );
      },
    ),
  ];
  return res;
}

/**
 * Template literals are linted using their raw text, so offsets in the linted
 * template line up with the source and only need to be shifted.
 */
function mapTemplateLiteralMessage(
  message: InlineTemplateMessage,
  rangeData: RangeData,
): InlineTemplateMessage {
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
  if (message.endLine === 1 && message.endColumn !== undefined) {
    message.endColumn += rangeData.lineAndCharacter.start.character + 1;
  }

  message.line += rangeData.lineAndCharacter.start.line;
  if (message.endLine !== undefined) {
    message.endLine += rangeData.lineAndCharacter.start.line;
  }

  // The range defines the range of the value that initializes
  // the `template` property, which includes the opening and
  // closing quotes. Add one to move past the opening quote.
  const startOffset = rangeData.range[0] + 1;
  const adjustFixRange = (fix: { range: number[] }) => {
    fix.range = [startOffset + fix.range[0], startOffset + fix.range[1]];
  };

  if (message.fix) {
    adjustFixRange(message.fix);
  }

  // Suggestions carry their own fixes, which are also
  // relative to the inline template and need the same adjustment.
  message.suggestions?.forEach((suggestion) => adjustFixRange(suggestion.fix));
  return message;
}

/**
 * String literals are linted using their decoded value, so positions are
 * mapped through the escape sequences, and replacement text is escaped again.
 * Fixes and suggestions that cannot be expressed in the literal such that it
 * decodes to exactly what the rule intended are dropped.
 */
function mapStringLiteralTemplateMessage(
  message: InlineTemplateMessage,
  template: StringLiteralTemplate,
): InlineTemplateMessage {
  const toSourceLocation = (
    line: number,
    column: number,
    fallbackOffset: number,
  ) => {
    const offset = template.virtualSource.offsetAt(line, column);
    return template.source.locationAt(
      (offset === undefined ? undefined : template.offsets[offset]) ??
        fallbackOffset,
    );
  };

  const start = toSourceLocation(
    message.line,
    message.column,
    template.offsets[0],
  );
  message.line = start.line;
  message.column = start.column;

  if (message.endLine !== undefined && message.endColumn !== undefined) {
    const end = toSourceLocation(
      message.endLine,
      message.endColumn,
      template.offsets[template.offsets.length - 1],
    );
    message.endLine = end.line;
    message.endColumn = end.column;
  }

  if (message.fix) {
    const fix = mapStringLiteralEdit(message.fix, template);
    if (fix) {
      message.fix = fix;
    } else {
      delete message.fix;
    }
  }

  if (message.suggestions) {
    message.suggestions = message.suggestions.flatMap((suggestion) => {
      const fix = mapStringLiteralEdit(suggestion.fix, template);
      return fix ? [{ ...suggestion, fix }] : [];
    });
    if (!message.suggestions.length) {
      delete message.suggestions;
    }
  }

  return message;
}

function mapStringLiteralEdit(
  edit: TextEdit,
  template: StringLiteralTemplate,
): TextEdit | undefined {
  const [start, end] = edit.range;
  const sourceStart = template.offsets[start];
  const sourceEnd = template.offsets[end];
  if (sourceStart === undefined || sourceEnd === undefined || start > end) {
    return undefined;
  }

  const text = escapeStringLiteralText(edit.text, template.quote);
  const rawStart = template.offsets[0];
  const editedRaw =
    template.raw.slice(0, sourceStart - rawStart) +
    text +
    template.raw.slice(sourceEnd - rawStart);
  const intendedText =
    template.text.slice(0, start) + edit.text + template.text.slice(end);

  // Catches edits that would split an escape sequence or change how an
  // escape sequence next to the edit is read, e.g. `\0` followed by a digit
  if (
    scanStringLiteral(template.quote + editedRaw + template.quote) !==
    intendedText
  ) {
    return undefined;
  }

  return { range: [sourceStart, sourceEnd], text };
}
