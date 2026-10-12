import {
  preprocessComponentFile,
  postprocessComponentFile,
} from './inline-templates';
import {
  createInlineStylesProcessor,
  inlineStyleLanguages,
} from './inline-styles';
export {
  isFileLikelyToContainComponentDeclarations,
  preprocessComponentFile,
  postprocessComponentFile,
} from './inline-templates';
import type { InlineStyleLanguage } from './inline-styles';

export interface ProcessorOptions {
  inlineTemplates?: boolean;
  inlineStyles?: false | { inlineStyleLanguage: InlineStyleLanguage };
}

const processors = {
  'extract-inline-html': {
    meta: {
      name: 'extract-inline-html',
    },
    preprocess: preprocessComponentFile,
    postprocess: postprocessComponentFile,
    supportsAutofix: true as const,
  },
};

const configuredProcessors = new Map<
  string,
  ReturnType<typeof createInlineStylesProcessor>
>();

export function createProcessor({
  inlineTemplates = true,
  inlineStyles = false,
}: ProcessorOptions = {}) {
  if (typeof inlineTemplates !== 'boolean') {
    throw new Error('inlineTemplates must be a boolean');
  }
  if (inlineStyles === false) {
    if (!inlineTemplates) {
      throw new Error(
        'inlineTemplates and inlineStyles cannot both be disabled',
      );
    }
    return processors['extract-inline-html'];
  }
  if (
    !inlineStyles ||
    typeof inlineStyles !== 'object' ||
    !inlineStyles.inlineStyleLanguage
  ) {
    throw new Error(
      "inlineStyles requires inlineStyleLanguage (copy it from angular.json; Angular's default is 'css')",
    );
  }

  const { inlineStyleLanguage } = inlineStyles;
  if (!inlineStyleLanguages.includes(inlineStyleLanguage)) {
    throw new Error(
      `createProcessor: unsupported inlineStyleLanguage "${inlineStyleLanguage}", expected one of: ${inlineStyleLanguages.join(', ')}`,
    );
  }
  const name = `extract-inline[${inlineTemplates ? 'templates,' : ''}styles=${inlineStyleLanguage}]`;
  let processor = configuredProcessors.get(name);
  if (!processor) {
    processor = createInlineStylesProcessor(
      inlineStyleLanguage,
      inlineTemplates,
    );
    configuredProcessors.set(name, processor);
  }
  return processor;
}

export default processors;
