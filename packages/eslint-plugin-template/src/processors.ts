import { basename, dirname } from 'path';
import type { Attribute } from '@angular-eslint/bundled-angular-compiler';
import {
  HtmlParser,
  RecursiveVisitor,
  visitAll,
} from '@angular-eslint/bundled-angular-compiler';
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
        sourceFilename: filename,
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
        const inlineTemplateTmpFilename = `inline-template-${baseFilename}-${i + 1}.component.html`;
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

type TextEdit = {
  range: [number, number];
  text: string;
};

type StyleSuggestion = {
  fix?: TextEdit;
  [key: string]: unknown;
};

type StyleMessage = {
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  fix?: TextEdit;
  suggestions?: StyleSuggestion[];
  [key: string]: unknown;
};

type MappedStyle = {
  kind: 'component' | 'attribute';
  text: string;
  offsets: number[];
  sourceFile: ts.SourceFile;
  virtualSource: ts.SourceFile;
  nestedTemplate?: boolean;
  /** Fix text matching any of these cannot be inserted into the original source verbatim */
  unsafeFixText: RegExp[];
};

type TemplateSource = Omit<MappedStyle, 'kind'>;

const unsafeLiteralFixText: Record<string, RegExp> = {
  "'": /[\\'\r\n]/,
  '"': /[\\"\r\n]/,
  '`': /[\\`]|\$\{/,
};

function getComponentImportNames(sourceFile: ts.SourceFile) {
  const componentImports = new Set<string>();
  const namespaceImports = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@angular/core'
    ) {
      continue;
    }

    const importClause = statement.importClause;
    if (!importClause || importClause.isTypeOnly) {
      continue;
    }

    const namedBindings = importClause.namedBindings;
    if (namedBindings && ts.isNamespaceImport(namedBindings)) {
      namespaceImports.add(namedBindings.name.text);
    }
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        if (
          !element.isTypeOnly &&
          (element.propertyName ?? element.name).text === 'Component'
        ) {
          componentImports.add(element.name.text);
        }
      }
    }
  }

  return { componentImports, namespaceImports };
}

function isComponentDecorator(
  decorator: ts.Decorator,
  componentImports: Set<string>,
  namespaceImports: Set<string>,
): decorator is ts.Decorator & {
  expression: ts.CallExpression;
} {
  if (!ts.isCallExpression(decorator.expression)) {
    return false;
  }

  const target = decorator.expression.expression;
  if (ts.isIdentifier(target)) {
    return componentImports.has(target.text);
  }

  return (
    ts.isPropertyAccessExpression(target) &&
    ts.isIdentifier(target.expression) &&
    namespaceImports.has(target.expression.text) &&
    target.name.text === 'Component'
  );
}

function mapLiteral(
  literal: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
  sourceFile: ts.SourceFile,
): MappedStyle | undefined {
  const start = literal.getStart(sourceFile);
  const quote = sourceFile.text[start];
  const raw = sourceFile.text.slice(start + 1, literal.end - 1);
  const offsets = [start + 1];
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false);
  let text = '';

  for (let index = 0; index < raw.length;) {
    const escape =
      raw[index] === '\\'
        ? /^\\(?:u\{[\da-fA-F]+\}|u[\da-fA-F]{4}|x[\da-fA-F]{2}|\r\n|[\s\S])/.exec(
            raw.slice(index),
          )?.[0]
        : undefined;
    const chunk =
      escape ?? (raw.startsWith('\r\n', index) ? '\r\n' : raw[index]);
    let decoded = chunk;

    if (escape) {
      scanner.setText(quote + chunk + quote);
      scanner.scan();
      decoded = scanner.getTokenValue();
    } else if (quote === '`' && chunk.startsWith('\r')) {
      decoded = '\n';
    }

    index += chunk.length;
    text += decoded;
    for (let count = 0; count < decoded.length; count++) {
      offsets.push(start + 1 + index);
    }
    if (!decoded.length) {
      offsets[offsets.length - 1] = start + 1 + index;
    }
  }

  if (text !== literal.text) {
    return undefined;
  }

  return {
    kind: 'component',
    text,
    offsets,
    sourceFile,
    virtualSource: ts.createSourceFile(
      'inline-style.css',
      text,
      ts.ScriptTarget.Latest,
    ),
    unsafeFixText: [unsafeLiteralFixText[quote]],
  };
}

function extractTemplateStyles(template: TemplateSource): MappedStyle[] {
  const styles: MappedStyle[] = [];
  const parsed = new HtmlParser().parse(template.text, 'template.html', {
    tokenizeBlocks: true,
  });

  class StyleVisitor extends RecursiveVisitor {
    override visitAttribute(attribute: Attribute) {
      if (attribute.name !== 'style' || !attribute.valueSpan) {
        return;
      }

      const valueTokens = attribute.valueTokens ?? [];
      if (template.nestedTemplate && attribute.value.includes('${')) {
        return;
      }
      // Interpolation tokens are [start, expression, end]; like [style] bindings they are not static CSS
      if (valueTokens.some((token) => token.parts.length === 3)) {
        return;
      }

      const offsets = [attribute.valueSpan.start.offset];
      let value = '';
      for (const token of valueTokens) {
        const decoded = token.parts[0];
        const start = token.sourceSpan.start.offset;
        const end = token.sourceSpan.end.offset;
        const raw = template.text.slice(start, end);
        let rawIndex = 0;

        for (let index = 0; index < decoded.length; index++) {
          rawIndex +=
            raw.startsWith('\r\n', rawIndex) && decoded[index] === '\n' ? 2 : 1;
          offsets.push(token.parts.length > 1 ? end : start + rawIndex);
        }
        value += decoded;
      }

      if (value !== attribute.value) {
        return;
      }

      const start = offsets[0];
      const end = offsets[offsets.length - 1];
      const quote = template.text[start - 1];
      const text = `a{${value}}`;
      styles.push({
        kind: 'attribute',
        nestedTemplate: template.nestedTemplate,
        text,
        offsets: [start, start, ...offsets, end].map(
          (offset) => template.offsets[offset],
        ),
        sourceFile: template.sourceFile,
        virtualSource: ts.createSourceFile(
          'attribute.css',
          text,
          ts.ScriptTarget.Latest,
        ),
        unsafeFixText: [
          ...template.unsafeFixText,
          quote === '"' || quote === "'"
            ? new RegExp(`[${quote}&]`)
            : /[\s=<>"'`&]/,
        ],
      });
    }
  }

  visitAll(new StyleVisitor(), parsed.rootNodes);
  return styles;
}

function extractComponentStyles(sourceFile: ts.SourceFile): MappedStyle[] {
  const { componentImports, namespaceImports } =
    getComponentImportNames(sourceFile);
  const styles: MappedStyle[] = [];

  for (const classDeclaration of getClassDeclarationFromSourceFile(
    sourceFile,
  )) {
    for (const decorator of ts.getDecorators(classDeclaration) ?? []) {
      if (
        !isComponentDecorator(decorator, componentImports, namespaceImports)
      ) {
        continue;
      }

      const metadata = decorator.expression.arguments[0];
      if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
        continue;
      }

      for (const property of metadata.properties) {
        if (!ts.isPropertyAssignment(property)) {
          continue;
        }

        const propertyName = property.name.getText(sourceFile);
        if (propertyName !== 'styles' && propertyName !== 'template') {
          continue;
        }

        const values = ts.isArrayLiteralExpression(property.initializer)
          ? property.initializer.elements
          : [property.initializer];
        for (const value of values) {
          if (
            !ts.isStringLiteral(value) &&
            !ts.isNoSubstitutionTemplateLiteral(value)
          ) {
            continue;
          }

          const mapped = mapLiteral(value, sourceFile);
          if (!mapped) {
            continue;
          }

          if (propertyName === 'template') {
            styles.push(...extractTemplateStyles(mapped));
          } else {
            styles.push(mapped);
          }
        }
      }
    }
  }

  return styles;
}

function mapStyleMessage(message: StyleMessage, style: MappedStyle) {
  function location(line: number, column: number, fallbackOffset: number) {
    let offset: number | undefined;
    try {
      offset = style.virtualSource.getPositionOfLineAndCharacter(
        line - 1,
        column - 1,
      );
    } catch {
      // The CSS linter reported a location outside of the virtual file
    }
    const sourceOffset =
      (offset === undefined ? undefined : style.offsets[offset]) ??
      fallbackOffset;
    const position =
      style.sourceFile.getLineAndCharacterOfPosition(sourceOffset);
    return { line: position.line + 1, column: position.character + 1 };
  }

  function fix(edit: TextEdit) {
    if (style.nestedTemplate) {
      return undefined;
    }
    const [startOffset, endOffset] = edit.range;
    const start = style.offsets[startOffset];
    const end = style.offsets[endOffset];
    if (start === undefined || end === undefined) {
      return undefined;
    }
    if (
      style.sourceFile.text.slice(start, end) !==
      style.text.slice(startOffset, endOffset)
    ) {
      return undefined;
    }
    if (style.unsafeFixText.some((pattern) => pattern.test(edit.text))) {
      return undefined;
    }
    const boundaryText =
      style.sourceFile.text.slice(Math.max(0, start - 1), start) +
      edit.text +
      style.sourceFile.text.slice(end, end + 1);
    if (
      boundaryText.includes('${') &&
      style.unsafeFixText.some((pattern) => pattern.test('${'))
    ) {
      return undefined;
    }
    return { ...edit, range: [start, end] as [number, number] };
  }

  const mapped: StyleMessage = { ...message };
  if (message.line !== undefined && message.column !== undefined) {
    Object.assign(
      mapped,
      location(message.line, message.column, style.offsets[0]),
    );
  }
  if (message.endLine !== undefined && message.endColumn !== undefined) {
    const end = location(
      message.endLine,
      message.endColumn,
      style.offsets[style.offsets.length - 1],
    );
    mapped.endLine = end.line;
    mapped.endColumn = end.column;
  }
  if (message.fix) {
    mapped.fix = fix(message.fix);
  }
  if (message.suggestions) {
    mapped.suggestions = message.suggestions.flatMap((suggestion) => {
      const edit = suggestion.fix ? fix(suggestion.fix) : undefined;
      return edit ? [{ ...suggestion, fix: edit }] : [];
    });
  }
  return mapped;
}

type PendingStyles = {
  templateCount: number;
  styles: MappedStyle[];
};

const pendingStyles = new Map<string, PendingStyles>();

const inlineStyleLanguages = ['css', 'scss', 'sass', 'less'] as const;

export type InlineStyleLanguage = (typeof inlineStyleLanguages)[number];

export interface InlineStylesProcessorOptions {
  /** Language of `styles` in component metadata, matching Angular's `inlineStyleLanguage` option. Defaults to `css`. */
  inlineStyleLanguage?: InlineStyleLanguage;
}

function preprocessInlineStyles(
  text: string,
  filename: string,
  inlineStyleLanguage: InlineStyleLanguage,
): PreprocessResult {
  pendingStyles.delete(filename);
  const baseFilename = basename(filename);

  if (filename.endsWith('.html')) {
    if (!/\bstyle\s*=/i.test(text)) {
      return [text];
    }
    // Relies on ESLint naming nested code blocks `<parent file>/<index>_<block filename>`
    // (lib/services/processor-service.js); the "reports inline attributes once" test guards this.
    const parentStyles = pendingStyles.get(dirname(filename));
    const templateFilename = baseFilename.replace(/^\d+_/, '');
    const templateData = rangeMap.get(templateFilename);
    const nestedTemplate = templateData?.sourceFilename === dirname(filename);
    const templateRange = nestedTemplate ? templateData.range : undefined;
    if (
      templateRange &&
      parentStyles?.styles.some(
        (style) =>
          style.kind === 'attribute' &&
          style.offsets[0] >= templateRange[0] &&
          style.offsets[style.offsets.length - 1] <= templateRange[1],
      )
    ) {
      return [text];
    }
    const sourceFile = ts.createSourceFile(
      filename,
      text,
      ts.ScriptTarget.Latest,
    );
    const styles = extractTemplateStyles({
      text,
      sourceFile,
      offsets: Array.from({ length: text.length + 1 }, (_, index) => index),
      virtualSource: sourceFile,
      unsafeFixText: [],
      nestedTemplate,
    });
    if (!styles.length) {
      return [text];
    }
    pendingStyles.set(filename, { templateCount: 1, styles });
    return [
      text,
      ...styles.map((style, index) => ({
        text: style.text,
        filename: `attribute-style-${baseFilename}-${index + 1}.css`,
      })),
    ];
  }

  if (
    !filename.endsWith('.ts') ||
    !isFileLikelyToContainComponentDeclarations(text, filename)
  ) {
    return [text];
  }

  const sourceFile = ts.createSourceFile(
    filename,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );
  const templates = preprocessComponentFile(text, filename, sourceFile);
  let styles: MappedStyle[];
  try {
    styles = extractComponentStyles(sourceFile);
  } catch {
    return templates;
  }

  pendingStyles.set(filename, { templateCount: templates.length, styles });
  return [
    ...templates,
    ...styles.map((style, index) => ({
      text: style.text,
      filename:
        style.kind === 'attribute'
          ? `attribute-style-${baseFilename}-${index + 1}.css`
          : `inline-style-${baseFilename}-${index + 1}.${inlineStyleLanguage}`,
    })),
  ];
}

function postprocessInlineStyles(
  multiDimensionalMessages: Parameters<typeof postprocessComponentFile>[0],
  filename: string,
): readonly unknown[] {
  const pending = pendingStyles.get(filename);
  pendingStyles.delete(filename);
  if (!pending) {
    return postprocessComponentFile(multiDimensionalMessages, filename);
  }

  const results = postprocessComponentFile(
    multiDimensionalMessages.slice(0, pending.templateCount),
    filename,
  );
  return [
    ...results,
    ...pending.styles.flatMap((style, index) =>
      (multiDimensionalMessages[pending.templateCount + index] ?? []).map(
        (message) => mapStyleMessage(message as StyleMessage, style),
      ),
    ),
  ];
}

export interface InlineStylesProcessor {
  meta: { name: string };
  preprocess: (text: string, filename: string) => PreprocessResult;
  postprocess: typeof postprocessInlineStyles;
  supportsAutofix: true;
  withOptions: (
    options?: InlineStylesProcessorOptions,
  ) => InlineStylesProcessor;
}

function createInlineStylesProcessor({
  inlineStyleLanguage = 'css',
}: InlineStylesProcessorOptions = {}): InlineStylesProcessor {
  if (!inlineStyleLanguages.includes(inlineStyleLanguage)) {
    throw new Error(
      `extract-inline-styles: unsupported inlineStyleLanguage "${inlineStyleLanguage}", expected one of: ${inlineStyleLanguages.join(', ')}`,
    );
  }
  return {
    meta: {
      name:
        inlineStyleLanguage === 'css'
          ? 'extract-inline-styles'
          : `extract-inline-styles-${inlineStyleLanguage}`,
    },
    preprocess: (text, filename) =>
      preprocessInlineStyles(text, filename, inlineStyleLanguage),
    postprocess: postprocessInlineStyles,
    supportsAutofix: true,
    withOptions: createInlineStylesProcessor,
  };
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
  'extract-inline-styles': createInlineStylesProcessor(),
};
