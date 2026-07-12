import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

export type Options = [];
export type MessageIds = 'noOuterHtml';
export const RULE_NAME = 'no-outerhtml';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows using `outerHTML` on elements, which breaks change detection and detaches the element from the Angular view',
    },
    schema: [],
    messages: {
      noOuterHtml:
        'Do not use `outerHTML`. Binding to `[outerHTML]` throws on update because setting `outerHTML` replaces the host element itself, so Angular loses its reference to the node ("This element has no parent node"); a static `outerHTML` attribute is not a real DOM attribute and has no effect. Use `[innerHTML]` (being mindful of sanitization) or restructure the template instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const elementNamePattern = toPattern([...getDomElements()]);

    return {
      [`Element[name=${elementNamePattern}] > :matches(BoundAttribute, TextAttribute)`](
        node: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        if (node.name.toLowerCase() !== 'outerhtml') {
          return;
        }

        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(
            node.keySpan ?? node.sourceSpan,
          ),
          messageId: 'noOuterHtml',
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Setting an element's `outerHTML` replaces the element itself in the DOM, including the very node Angular is bound to. Angular keeps an internal reference to that node in order to apply future updates during change detection. Once the node has been swapped out, it no longer has a parent in the document, so the next attempt to write to `outerHTML` fails with `NoModificationAllowedError: Failed to set the 'outerHTML' property on 'Element': This element has no parent node`. The initial render appears to work, which makes the problem easy to miss until the bound value changes at runtime or in a test that calls `detectChanges()`.\n\nBecause this is inherent to how `outerHTML` works — not a fixable framework bug (see angular/angular#41131 and angular/angular#41576, both closed) — there is effectively no correct way to use `outerHTML` in an Angular template. A static `outerHTML=\"...\"` attribute is not a real DOM attribute either and simply has no effect, so this rule disallows every form of `outerHTML` on native elements (`[outerHTML]`, `bind-outerHTML`, `[attr.outerHTML]` and the static attribute). Bindings to `outerHTML` on components are left alone, since there they are ordinary inputs rather than the DOM property.\n\nIn almost all cases the intent is to render dynamic markup inside the element, which is exactly what `[innerHTML]` does safely (it only replaces the element's content and preserves the host node). Note that `[innerHTML]` runs Angular's built-in sanitization; when rendering untrusted content, sanitization concerns still apply. If the goal was actually to replace the element (tag, attributes and all), the component should be restructured — for example by conditionally rendering different elements with `@if`/`@switch` — rather than reaching for `outerHTML`.",
};
