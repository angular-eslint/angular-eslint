import { basename } from 'path';
import type { Attribute } from '@angular-eslint/bundled-angular-compiler';
import {
  HtmlParser,
  RecursiveVisitor,
  visitAll,
} from '@angular-eslint/bundled-angular-compiler';
import ts from 'typescript';

import {
  getComponentMetadata,
  isFileLikelyToContainComponentDeclarations,
  preprocessComponentFile,
  postprocessComponentFile,
  type PreprocessResult,
} from './inline-templates';

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
  source: ReturnType<typeof createTextSource>;
  virtualSource: ReturnType<typeof createTextSource>;
  /** Fix text matching any of these cannot be inserted into the original source verbatim */
  unsafeFixText: RegExp[];
};

type TemplateSource = Omit<MappedStyle, 'kind' | 'virtualSource'>;

function createTextSource(text: string) {
  const lineStarts = [0];
  for (let index = 0; index < text.length; index++) {
    const character = text.charCodeAt(index);
    if (character === 13 && text.charCodeAt(index + 1) === 10) {
      index++;
    }
    if (
      character === 10 ||
      character === 13 ||
      character === 0x2028 ||
      character === 0x2029
    ) {
      lineStarts.push(index + 1);
    }
  }
  return {
    text,
    offsetAt(line: number, column: number): number | undefined {
      const start = lineStarts[line - 1];
      if (start === undefined || column < 1 || !Number.isInteger(column)) {
        return undefined;
      }
      const offset = start + column - 1;
      const nextStart = lineStarts[line];
      if (
        nextStart !== undefined ? offset >= nextStart : offset > text.length
      ) {
        return undefined;
      }
      return offset;
    },
    locationAt(offset: number) {
      let start = 0;
      let end = lineStarts.length;
      while (start + 1 < end) {
        const middle = Math.floor((start + end) / 2);
        if (lineStarts[middle] > offset) {
          end = middle;
        } else {
          start = middle;
        }
      }
      return { line: start + 1, column: offset - lineStarts[start] + 1 };
    },
  };
}

const unsafeLiteralFixText: Record<string, RegExp> = {
  "'": /[\\'\r\n]/,
  '"': /[\\"\r\n]/,
  '`': /[\\`]|\$\{/,
};

function mapLiteral(
  literal: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
  sourceFile: ts.SourceFile,
  source: ReturnType<typeof createTextSource>,
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
    source,
    virtualSource: createTextSource(text),
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
        text,
        offsets: [start, start, ...offsets, end].map(
          (offset) => template.offsets[offset],
        ),
        source: template.source,
        virtualSource: createTextSource(text),
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
  const styles: MappedStyle[] = [];
  const source = createTextSource(sourceFile.text);

  for (const metadata of getComponentMetadata(sourceFile)) {
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

        const mapped = mapLiteral(value, sourceFile, source);
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

  return styles;
}

function mapStyleMessage(message: StyleMessage, style: MappedStyle) {
  function location(line: number, column: number, fallbackOffset: number) {
    const offset = style.virtualSource.offsetAt(line, column);
    const sourceOffset =
      (offset === undefined ? undefined : style.offsets[offset]) ??
      fallbackOffset;
    return style.source.locationAt(sourceOffset);
  }

  function fix(edit: TextEdit) {
    const [startOffset, endOffset] = edit.range;
    const start = style.offsets[startOffset];
    const end = style.offsets[endOffset];
    if (start === undefined || end === undefined) {
      return undefined;
    }
    if (
      style.source.text.slice(start, end) !==
      style.text.slice(startOffset, endOffset)
    ) {
      return undefined;
    }
    if (style.unsafeFixText.some((pattern) => pattern.test(edit.text))) {
      return undefined;
    }
    const boundaryText =
      style.source.text.slice(Math.max(0, start - 1), start) +
      edit.text +
      style.source.text.slice(end, end + 1);
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

export const inlineStyleLanguages = ['css', 'scss', 'sass', 'less'] as const;

export type InlineStyleLanguage = (typeof inlineStyleLanguages)[number];

function preprocessInlineStyles(
  text: string,
  filename: string,
  inlineStyleLanguage: InlineStyleLanguage,
  inlineTemplates: boolean,
): PreprocessResult {
  pendingStyles.delete(filename);
  const baseFilename = basename(filename);

  if (filename.endsWith('.html')) {
    if (
      /inline-template-.+-\d+\.component\.html$/.test(baseFilename) ||
      !/\bstyle\s*=/i.test(text)
    ) {
      return [text];
    }
    let styles: MappedStyle[];
    try {
      styles = extractTemplateStyles({
        text,
        source: createTextSource(text),
        offsets: Array.from({ length: text.length + 1 }, (_, index) => index),
        unsafeFixText: [],
      });
    } catch {
      return [text];
    }
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
  const templates = inlineTemplates
    ? preprocessComponentFile(text, filename, sourceFile)
    : [text];
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
      (multiDimensionalMessages[pending.templateCount + index] ?? [])
        .filter((message) => {
          if (
            style.kind !== 'attribute' ||
            (message as StyleMessage).fatal === true
          ) {
            return true;
          }
          const offset = style.virtualSource.offsetAt(
            message.line,
            message.column,
          );
          return (
            offset === undefined ||
            (offset >= 2 && offset !== style.text.length - 1)
          );
        })
        .map((message) => mapStyleMessage(message as StyleMessage, style)),
    ),
  ];
}

export interface InlineStylesProcessor {
  meta: { name: string };
  preprocess: (text: string, filename: string) => PreprocessResult;
  postprocess: typeof postprocessInlineStyles;
  supportsAutofix: true;
}

export function createInlineStylesProcessor(
  inlineStyleLanguage: InlineStyleLanguage,
  inlineTemplates: boolean,
): InlineStylesProcessor {
  return {
    meta: {
      name: `extract-inline[${inlineTemplates ? 'templates,' : ''}styles=${inlineStyleLanguage}]`,
    },
    preprocess: (text, filename) =>
      preprocessInlineStyles(
        text,
        filename,
        inlineStyleLanguage,
        inlineTemplates,
      ),
    postprocess: postprocessInlineStyles,
    supportsAutofix: true,
  };
}
