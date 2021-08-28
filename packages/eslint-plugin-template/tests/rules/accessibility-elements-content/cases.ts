import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/accessibility-elements-content';

const messageId: MessageIds = 'accessibilityElementsContent';

export const valid = [
  '<h1>Heading Content!</h1>',
  '<h2><app-content></app-content></h2>',
  '<h3 [innerHtml]="dangerouslySetHTML"></h3>',
  '<h4 [innerText]="text"></h4>',
  '<a>Anchor Content!</a>',
  '<a><app-content></app-content></a>',
  '<a [innerHTML]="dangerouslySetHTML"></a>',
  '<a [innerText]="text"></a>',
  '<a [outerHTML]="text"></a>',
  '<a aria-hidden></a>',
  '<button [attr.aria-hidden]="true"></button>',
  '<h5 [attr.aria-label]="text"></h5>',
  '<h6 title="text"></h6>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with no content in heading tag',
    annotatedSource: `
        <h1 class="size-1"></h1>
        ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { element: 'h1' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with no content in anchor tag',
    annotatedSource: `
        <a href="#" [routerLink]="['route1']"></a>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { element: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with no content in button tag',
    annotatedSource: `
        <button></button>
        ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { element: 'button' },
  }),
];
