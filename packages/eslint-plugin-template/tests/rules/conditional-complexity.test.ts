import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/conditional-complexity';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'conditionalСomplexity';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        <div *ngIf="a === '1' || b === '2' && c.d !== e">
          Enter your card details
        </div>
      `,
    },
    {
      code: `
        <div *ngIf="a === '1' || (b === '2' && c.d !== e)">
          Enter your card details
        </div>
      `,
    },
    {
      code: `
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
          Enter your card details
        </div>
    `,
      options: [{ maxComplexity: 9 }],
    },
    {
      code: `
        <div *ngIf="(b === '3' && c.d !== '1' && e.f !== '6' && q !== g) || a === '3'">
          Enter your card details
        </div>
      `,
      options: [{ maxComplexity: 9 }],
    },
    {
      code: `
        <div *ngIf="isValid; then thenBlock; else elseBlock">
          Enter your card details
        </div>
        <ng-template #thenBlock>
          thenBlock
        </ng-template>
        <ng-template #elseBlock>
          elseBlock
        </ng-template>
      `,
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail with a higher level of complexity',
      annotatedSource: `
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Enter your card details
        </div>
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail with a higher level of complexity and a carrier return',
      annotatedSource: `
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1'
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    && e.f !== '6' && q !== g)">
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~
          Enter your card details
        </div>
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail with a higher level of complexity with ng-template',
      annotatedSource: `
        <ng-template [ngIf]="a === '3' || (b === '3' && c.d !== '1'
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    && e.f !== '6' && q !== g && x === '1')">
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Enter details
        </ng-template>
      `,
    }),
  ],
});
