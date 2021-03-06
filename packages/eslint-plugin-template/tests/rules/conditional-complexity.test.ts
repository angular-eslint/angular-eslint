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
    `
      <div *ngIf="a === '1' || b === '2' && c.d !== e">Content</div>
      <div *ngIf="isValid; then thenTemplateRef; else elseTemplateRef">Content</div>
      <ng-template #thenTemplateRef>thenTemplateRef</ng-template>
      <ng-template #elseTemplateRef>elseTemplateRef</ng-template>
      <div [class.mw-100]="test === 7"></div>
      <div [attr.aria-label]="testing === 'ab' ? 'bc' : 'de'"></div>
      <div [attr.custom-attr]="'test345' | appPipe"></div>
    `,
    {
      code: `
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
          Content
        </div>
      `,
      options: [{ maxComplexity: 9 }],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if the conditional complexity exceeds the maximum default',
      annotatedSource: `
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Content
        </div>
      `,
      data: { maxComplexity: 5, totalComplexity: 9 },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if the conditional complexity exceeds the maximum defined',
      annotatedSource: `
        <ng-container *ngIf="control && control.invalid && (control.touched || (showOnDirty && control.dirty))">
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Content
        </ng-container>
      `,
      data: { maxComplexity: 3, totalComplexity: 4 },
      options: [{ maxComplexity: 3 }],
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if the conditional complexity exceeds the maximum defined when using pipes to create a variable',
      annotatedSource: `
        <ng-container *ngIf="control && control.invalid && (control.touched || (showOnDirty && control.dirty)) && control.errors | keys as errorKeys">
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          {{ errorKeys }}
        </ng-container>
      `,
      data: { maxComplexity: 2, totalComplexity: 5 },
      options: [{ maxComplexity: 2 }],
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if the conditional complexity exceeds the maximum default when using [class] binding',
      annotatedSource: `
        <div [class.px-4]="a <= b || (b > c && c >= d && d < e)">
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Content
        </div>
      `,
      data: { maxComplexity: 5, totalComplexity: 7 },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if the conditional complexity exceeds the maximum default when using nested conditionals',
      annotatedSource: `
        <div [class.my-2]="a === 'x' ? v === c : b === 3 ? 0 : c > 3 && d === 9 ? 9 : 'xa'">
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          Content
        </div>
      `,
      data: { maxComplexity: 5, totalComplexity: 9 },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if the conditional complexity exceeds the maximum default when using conditionals within interpolation',
      annotatedSource: `
        {{ test.xyz }} {{ ab > 2 && cd === 9 && control?.invalid && (control.touched || (showOnDirty && control.dirty)) ? 'some value' : 'another value' }} {{ control.touched }}
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      data: { maxComplexity: 5, totalComplexity: 8 },
    }),
  ],
});
