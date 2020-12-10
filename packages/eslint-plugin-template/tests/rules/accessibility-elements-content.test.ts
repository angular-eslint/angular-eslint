import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/accessibility-elements-content';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'accessibilityElementsContent';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<h1>Heading Content!</h1>',
    '<h2><app-content></app-content></h2>',
    '<h3 [innerHTML]="dangerouslySetHTML"></h3>',
    '<h4 [innerText]="text"></h4>',
    '<a>Anchor Content!</a>',
    '<a><app-content></app-content></a>',
    '<a [innerHTML]="dangerouslySetHTML"></a>',
    '<a [innerText]="text"></a>',
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail with no content in heading tag',
      annotatedSource: `
        <h1 class="size-1"></h1>
        ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail with no content in anchor tag',
      annotatedSource: `
        <a href="#" [routerLink]="['route1']"></a>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail with no content in button tag',
      annotatedSource: `
        <button></button>
        ~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
