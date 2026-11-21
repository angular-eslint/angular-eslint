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
import {
  createTextSource,
  decodeLiteral,
  type TextSource,
} from './literal-text';

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
  source: TextSource;
  virtualSource: TextSource;
  /** Fix text matching any of these cannot be inserted into the original source verbatim */
  unsafeFixText: RegExp[];
};

type TemplateSource = Omit<MappedStyle, 'kind' | 'virtualSource'>;

const unsafeLiteralFixText: Record<string, RegExp> = {
  "'": /[\\'\r\n]/,
  '"': /[\\"\r\n]/,
  '`': /[\\`]|\$\{/,
};

/**
 * ESLint reports locations and applies fixes in the file without its byte
 * order mark, but the processor is given the text with it, so offsets in that
 * text are one too far when it starts with one
 */
function byteOrderMarkLength(text: string): number {
  return text.charCodeAt(0) === 0xfeff ? 1 : 0;
}

function mapLiteral(
  literal: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
  sourceFile: ts.SourceFile,
  source: TextSource,
  bom: number,
): MappedStyle | undefined {
  const decoded = decodeLiteral(literal, sourceFile);
  if (!decoded) {
    return undefined;
  }

  return {
    kind: 'component',
    text: decoded.text,
    offsets: decoded.offsets.map((offset) => offset - bom),
    source,
    virtualSource: createTextSource(decoded.text),
    unsafeFixText: [unsafeLiteralFixText[decoded.quote]],
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
  // Offsets are mapped onto the file as ESLint sees it, without any byte order mark
  const bom = byteOrderMarkLength(sourceFile.text);
  const source = createTextSource(sourceFile.text.slice(bom));

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

        const mapped = mapLiteral(value, sourceFile, source, bom);
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
    // Extract from the file as ESLint sees it, without any byte order mark
    const content = text.slice(byteOrderMarkLength(text));
    let styles: MappedStyle[];
    try {
      styles = extractTemplateStyles({
        text: content,
        source: createTextSource(content),
        offsets: Array.from(
          { length: content.length + 1 },
          (_, index) => index,
        ),
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
