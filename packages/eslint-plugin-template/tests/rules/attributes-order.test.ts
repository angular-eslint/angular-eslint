import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/attributes-order';
import rule, {
  OrderAttributeType,
  RULE_NAME,
} from '../../src/rules/attributes-order';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'attributesOrder';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `<input class="card" [value]="foo" (valueChange)="handleValueChange($event)">`,
    `<input *ngIf="flag" #inputRef id="input" class="className" [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">`,
    `<input *ngIf="flag" (output)="handleOutput($event)">`,
    `<input [(ngModel)]="model">`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if two way binding is in wrong place',
      annotatedSource: `
        <input *ngIf="flag" #inputRef class="className" [(ngModel)]="model" [binding]="true" (output)="handleOutput($event)">
                                                        ~~~~~~~~~~~~~~~~~~~
      `,
      data: {
        types: [
          OrderAttributeType.ATTRIBUTE_BINDING,
          OrderAttributeType.INPUT_BINDING,
        ].join(' or '),
      },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if structural directive is not first',
      annotatedSource: `
        <input #inputRef *ngIf="flag" class="className">
               ~~~~~~~~~
      `,
      data: { types: OrderAttributeType.STRUCTURAL_DIRECTIVE },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if attribute is in wrong place',
      annotatedSource: `
        <input *ngIf="flag" class="className" #inputRef [(ngModel)]="model" [binding]="true" (output)="handleOutput($event)">
                            ~~~~~~~~~~~~~~~~~
      `,
      data: {
        types: [
          OrderAttributeType.STRUCTURAL_DIRECTIVE,
          OrderAttributeType.TEMPLATE_REFERENCE,
        ].join(' or '),
      },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if output is in wrong place',
      annotatedSource: `
        <input *ngIf="flag" #inputRef class="className" (output)="handleOutput($event)" [binding]="true">
                                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      data: {
        types: [
          OrderAttributeType.ATTRIBUTE_BINDING,
          OrderAttributeType.INPUT_BINDING,
        ].join(' or '),
      },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if input is in wrong place',
      annotatedSource: `
        <input *ngFor="inputs" [binding]="true" class="className" (output)="handleOutput($event)">
                               ~~~~~~~~~~~~~~~~
      `,
      data: {
        types: [
          OrderAttributeType.STRUCTURAL_DIRECTIVE,
          OrderAttributeType.ATTRIBUTE_BINDING,
        ].join(' or '),
      },
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should work with custom order',
      annotatedSource: `
        <input #inputRef *ngIf="flag" id="input" class="className" [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">,
                                                                                    ~~~~~~~~~~~~~~~~~~~
      `,
      data: {
        types: [
          OrderAttributeType.INPUT_BINDING,
          OrderAttributeType.OUTPUT_BINDING,
        ].join(' or '),
      },
      options: [
        {
          order: [
            OrderAttributeType.TEMPLATE_REFERENCE,
            OrderAttributeType.STRUCTURAL_DIRECTIVE,
            OrderAttributeType.ATTRIBUTE_BINDING,
            OrderAttributeType.INPUT_BINDING,
            OrderAttributeType.OUTPUT_BINDING,
            OrderAttributeType.TWO_WAY_BINDING,
          ],
        },
      ],
    }),
  ],
});
