import { basename } from 'path';
import ts from 'typescript';
import {
  createTextSource,
  decodeLiteralText,
  mapStringLiteralEdit,
  sourceOffsetAt,
  type LiteralText,
  type TextSource,
} from './literal-text';

interface InlineTemplate {
  /** The `template` property's initializer, including its quotes */
  range: [number, number];
  /** Where the initializer starts, including any byte order mark */
  start: ts.LineAndCharacter;
  /**
   * Set for single- and double-quoted strings, whose decoded value is what
   * gets linted, so offsets in the linted text have to be mapped through the
   * escape sequences back to the TypeScript source. Template literals are
   * linted using their raw text.
   */
  stringLiteral?: LiteralText;
}

interface ComponentFile {
  /** The text of the TypeScript file, including any byte order mark */
  text: string;
  templates: InlineTemplate[];
}

/**
 * The inline templates found by the latest `preprocess()` of each file, which
 * `postprocess()` needs to map messages back onto the file. Entries are
 * removed once used so that the text of every file linted is not kept alive.
 */
const componentFiles = new Map<string, ComponentFile>();

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
  componentFiles.delete(filename);

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
    const templates: InlineTemplate[] = [];

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
      let stringLiteral: LiteralText | undefined;

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
        stringLiteral = decodeLiteralText(
          templatePropertyInitializer,
          sourceFile,
        );
        // Without a reliable mapping, reports and fixes would land in the wrong place
        if (!stringLiteral) {
          continue;
        }
        templateText = stringLiteral.text;
      }

      // The template initializer is somehow not a string literal or a string template
      if (!templateText) {
        continue;
      }

      const baseFilename = basename(filename);
      const inlineTemplateTmpFilename = `inline-template-${baseFilename}-${templates.length + 1}.component.html`;

      const start = templateProperty.initializer.getStart();
      const end = templateProperty.initializer.getEnd();

      templates.push({
        range: [start, end],
        start: sourceFile.getLineAndCharacterOfPosition(start),
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

    if (templates.length) {
      componentFiles.set(filename, { text, templates });
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
  const file = componentFiles.get(filename);
  componentFiles.delete(filename);

  const messagesFromComponentSource = multiDimensionalMessages[0];
  /**
   * If the Component did not have one or more inline templates defined within it
   * there will only be one item in the multiDimensionalMessages
   */
  if (multiDimensionalMessages.length === 1 || !file) {
    return messagesFromComponentSource;
  }

  /**
   * ESLint reports locations and applies fixes in the file without its byte
   * order mark, but the processor was given the text with it, so every offset
   * recorded during preprocessing is one too far
   */
  const bom = file.text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let source: TextSource | undefined;
  const getSource = () => (source ??= createTextSource(file.text.slice(bom)));

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
  return [
    ...messagesFromComponentSource,
    ...messagesFromAllInlineTemplateHTML.flatMap(
      (messagesFromInlineTemplateHTML, i) => {
        const template = file.templates[i];
        if (!template || !messagesFromInlineTemplateHTML.length) {
          return [];
        }

        const { stringLiteral } = template;
        if (!stringLiteral) {
          return messagesFromInlineTemplateHTML.map((message) =>
            mapTemplateLiteralMessage(message, template, bom),
          );
        }

        const context: StringLiteralTemplate = {
          literal: stringLiteral,
          text: file.text,
          bom,
          locate: createTemplateLocator(stringLiteral.text),
          source: getSource(),
        };
        return messagesFromInlineTemplateHTML.map((message) =>
          mapStringLiteralTemplateMessage(message, context),
        );
      },
    ),
  ];
}

/**
 * Template literals are linted using their raw text, so offsets in the linted
 * template line up with the source and only need to be shifted.
 */
function mapTemplateLiteralMessage(
  message: InlineTemplateMessage,
  template: InlineTemplate,
  bom: number,
): InlineTemplateMessage {
  // The first line of the inline template starts at the column after
  // the opening quote in the TypeScript file, so we need to adjust
  // the message's column by that amount when the message starts on
  // the first line. The character we recorded was the quote's column,
  // so add one to get the column where the actual string starts.
  const firstLineColumn =
    template.start.character + 1 - (template.start.line === 0 ? bom : 0);
  if (message.line === 1) {
    message.column += firstLineColumn;
  }

  // The same thing applies to the end column
  // if it also ends on the first line.
  if (message.endLine === 1 && message.endColumn !== undefined) {
    message.endColumn += firstLineColumn;
  }

  message.line += template.start.line;
  if (message.endLine !== undefined) {
    message.endLine += template.start.line;
  }

  // The range defines the range of the value that initializes
  // the `template` property, which includes the opening and
  // closing quotes. Add one to move past the opening quote.
  const startOffset = template.range[0] + 1 - bom;
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

type TemplateLocator = (
  line: number,
  column: number,
  endLine: number | undefined,
  endColumn: number | undefined,
  /** Ranges of the message's fix and suggestions in the decoded template */
  editRanges: readonly (readonly number[])[],
) => { start?: number; end?: number };

/**
 * Converts a reported location in a decoded template back to offsets.
 *
 * ESLint and Angular agree on where lines start unless the template contains
 * a carriage return that is not followed by a line feed, or a U+2028 or U+2029
 * separator: ESLint treats all of these as line breaks, whereas Angular, whose
 * spans most template rules report directly, only breaks lines at line feeds,
 * and its lexer does not count carriage returns towards the column. When
 * only one reading gives a valid range, that one is used. When both do and
 * they differ, the reading that overlaps the message's fix or suggestions is
 * used; if that doesn't decide it, no offsets are returned, so the message
 * falls back to the start of the template rather than highlighting unrelated
 * text.
 */
function createTemplateLocator(text: string): TemplateLocator {
  const eslint = createTextSource(text);
  if (!/\r(?!\n)|[\u2028\u2029]/.test(text)) {
    return (line, column, endLine, endColumn) => ({
      start: eslint.offsetAt(line, column),
      end:
        endLine === undefined || endColumn === undefined
          ? undefined
          : eslint.offsetAt(endLine, endColumn),
    });
  }

  const lineStarts = [0];
  const carriageReturns: number[] = [];
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '\n') {
      lineStarts.push(index + 1);
    } else if (text[index] === '\r') {
      carriageReturns.push(index);
    }
  }

  /** The index of the first carriage return for which `predicate` holds */
  const firstCarriageReturn = (predicate: (index: number) => boolean) => {
    let low = 0;
    let high = carriageReturns.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (predicate(middle)) {
        high = middle;
      } else {
        low = middle + 1;
      }
    }
    return low;
  };

  const angularOffsetAt = (line: number, column: number, isStart: boolean) => {
    const lineStart = lineStarts[line - 1];
    if (lineStart === undefined || column < 1 || !Number.isInteger(column)) {
      return undefined;
    }
    const lineEnd =
      line < lineStarts.length ? lineStarts[line] - 1 : text.length;
    // The offset after `column - 1` counted characters is `lineStart +
    // column - 1` plus the number of carriage returns on the line before it.
    // Carriage returns are in ascending order, so `carriageReturns[index] -
    // index` never decreases and the first one after it can be binary searched
    const first = firstCarriageReturn(
      (index) => carriageReturns[index] >= lineStart,
    );
    let index = firstCarriageReturn(
      (index) =>
        index >= first &&
        carriageReturns[index] - index >= lineStart + column - 1 - first,
    );
    let offset = lineStart + column - 1 + index - first;
    // Starts are after any carriage returns there, ends before them
    while (isStart && carriageReturns[index] === offset) {
      index++;
      offset++;
    }
    return offset <= lineEnd ? offset : undefined;
  };

  return (line, column, endLine, endColumn, editRanges) => {
    const hasEnd = endLine !== undefined && endColumn !== undefined;
    const isValid = (range: { start?: number; end?: number }) =>
      range.start !== undefined &&
      (!hasEnd || (range.end !== undefined && range.start <= range.end));

    const eslintRange = {
      start: eslint.offsetAt(line, column),
      end: hasEnd ? eslint.offsetAt(endLine, endColumn) : undefined,
    };
    const angularRange = {
      start: angularOffsetAt(line, column, true),
      end: hasEnd ? angularOffsetAt(endLine, endColumn, false) : undefined,
    };
    const eslintValid = isValid(eslintRange);
    const angularValid = isValid(angularRange);

    if (!eslintValid || !angularValid) {
      return eslintValid ? eslintRange : angularRange;
    }
    if (
      eslintRange.start === angularRange.start &&
      eslintRange.end === angularRange.end
    ) {
      return eslintRange;
    }

    const overlapsEdit = ({ start, end }: { start?: number; end?: number }) =>
      editRanges.some(
        ([editStart, editEnd]) =>
          start! <= editEnd && (end ?? start!) >= editStart,
      );
    const eslintOverlaps = overlapsEdit(eslintRange);
    const angularOverlaps = overlapsEdit(angularRange);
    if (eslintOverlaps !== angularOverlaps) {
      return eslintOverlaps ? eslintRange : angularRange;
    }
    return {};
  };
}

interface StringLiteralTemplate {
  literal: LiteralText;
  /** The text of the TypeScript file, including any byte order mark */
  text: string;
  bom: number;
  locate: TemplateLocator;
  /** The TypeScript file without any byte order mark */
  source: TextSource;
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
  const { literal, bom } = template;
  const toLocation = (offset: number | undefined, fallbackOffset: number) =>
    template.source.locationAt(
      (offset === undefined
        ? fallbackOffset
        : sourceOffsetAt(literal, offset).offset) - bom,
    );

  const hasEnd =
    message.endLine !== undefined && message.endColumn !== undefined;
  const { start, end } = template.locate(
    message.line,
    message.column,
    message.endLine,
    message.endColumn,
    [
      ...(message.fix ? [message.fix.range] : []),
      ...(message.suggestions ?? []).map(({ fix }) => fix.range),
    ],
  );

  const startLocation = toLocation(start, literal.start);
  message.line = startLocation.line;
  message.column = startLocation.column;

  if (hasEnd) {
    const endLocation = toLocation(end, literal.end);
    message.endLine = endLocation.line;
    message.endColumn = endLocation.column;
  }

  const mapEdit = (edit: TextEdit): TextEdit | undefined => {
    const mapped = mapStringLiteralEdit(literal, template.text, edit);
    return (
      mapped && {
        range: [mapped.range[0] - bom, mapped.range[1] - bom],
        text: mapped.text,
      }
    );
  };

  if (message.fix) {
    const fix = mapEdit(message.fix);
    if (fix) {
      message.fix = fix;
    } else {
      delete message.fix;
    }
  }

  if (message.suggestions) {
    message.suggestions = message.suggestions.flatMap((suggestion) => {
      const fix = mapEdit(suggestion.fix);
      return fix ? [{ ...suggestion, fix }] : [];
    });
    if (!message.suggestions.length) {
      delete message.suggestions;
    }
  }

  return message;
}
