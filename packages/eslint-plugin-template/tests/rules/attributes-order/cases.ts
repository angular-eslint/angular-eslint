import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/attributes-order';
import { OrderType } from '../../../src/rules/attributes-order';

const messageId: MessageIds = 'attributesOrder';

export const valid = [
  `<input class="card" [value]="foo" (valueChange)="handleValueChange($event)">`,
  `<input *ngIf="flag" #inputRef id="input" class="className" [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">`,
  `<input *ngIf="flag" (output)="handleOutput($event)">`,
  '<input *ngIf="flag" required>',
  `<input [(ngModel)]="model">`,
  '<input [(ngModel)]="model" (ngModelChange)="onChange($event)">',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if structural directive is not first',
    annotatedSource: `
      <input #inputRef *ngIf="flag" class="className">
             ~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: { expected: '`*ngIf`, `#inputRef`', actual: '`#inputRef`, `*ngIf`' },
    annotatedOutput: `
      <input *ngIf="flag" #inputRef class="className">
             
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if attribute is in wrong place',
    annotatedSource: `
      <input *ngIf="flag" class="className" #inputRef [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`#inputRef`, `class`',
      actual: '`class`, `#inputRef`',
    },
    annotatedOutput: `
      <input *ngIf="flag" #inputRef class="className" [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">
                          
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if input is in wrong place',
    annotatedSource: `
      <input *ngFor="inputs" [binding]="true" class="className" (output)="handleOutput($event)">
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`class`, `[binding]`',
      actual: '`[binding]`, `class`',
    },
    annotatedOutput: `
      <input *ngFor="inputs" class="className" [binding]="true" (output)="handleOutput($event)">
                             
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if two way binding is in wrong place',
    annotatedSource: `
      <input *ngIf="flag" #inputRef class="className" [(ngModel)]="model" [binding]="true" (output)="handleOutput($event)">
                                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`[binding]`, `[(ngModel)]`',
      actual: '`[(ngModel)]`, `[binding]`',
    },
    annotatedOutput: `
      <input *ngIf="flag" #inputRef class="className" [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">
                                                      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail if output is in wrong place',
    annotatedSource: `
      <input *ngIf="flag" #inputRef class="className" (output)="handleOutput($event)" [binding]="true">
                                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`[binding]`, `(output)`',
      actual: '`(output)`, `[binding]`',
    },
    annotatedOutput: `
      <input *ngIf="flag" #inputRef class="className" [binding]="true" (output)="handleOutput($event)">
                                                      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if structural directive is in wrong place with custom order',
    annotatedSource: `
      <input *ngIf="flag" class="className">
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [
      {
        order: [
          OrderType.TemplateReferenceVariable,
          OrderType.AttributeBinding,
          OrderType.StructuralDirective,
          OrderType.InputBinding,
          OrderType.OutputBinding,
          OrderType.TwoWayBinding,
        ],
      },
    ],
    data: {
      expected: '`class`, `*ngIf`',
      actual: '`*ngIf`, `class`',
    },
    annotatedOutput: `
      <input class="className" *ngIf="flag">
             
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work with custom order',
    annotatedSource: `
      <input *ngIf="flag" [(ngModel)]="model" #inputRef id="input" class="className" [binding]="true" (output)="handleOutput($event)">
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [
      {
        alphabetical: true,
        order: [
          OrderType.TemplateReferenceVariable,
          OrderType.StructuralDirective,
          OrderType.AttributeBinding,
          OrderType.InputBinding,
          OrderType.OutputBinding,
          OrderType.TwoWayBinding,
        ],
      },
    ],
    data: {
      expected:
        '`#inputRef`, `*ngIf`, `class`, `id`, `[binding]`, `(output)`, `[(ngModel)]`',
      actual:
        '`*ngIf`, `[(ngModel)]`, `#inputRef`, `id`, `class`, `[binding]`, `(output)`',
    },
    annotatedOutput: `
      <input #inputRef *ngIf="flag" class="className" id="input" [binding]="true" (output)="handleOutput($event)" [(ngModel)]="model">
             
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for multi-line',
    annotatedSource: `
      <input
        [(ngModel)]="model"
        ~~~~~~~~~~~~~~~~~~~
        *ngIf="flag"
        ~~~~~~~~~~~~
        #inputRef
        ~~~~~~~~~
        id="input"
        ~~~~~~~~~~
        class="className"
        ~~~~~~~~~~~~~~~~~
        (output)="handleOutput($event)"
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        [binding]="true">
        ~~~~~~~~~~~~~~~~
    `,
    data: {
      expected:
        '`*ngIf`, `#inputRef`, `id`, `class`, `[binding]`, `[(ngModel)]`, `(output)`',
      actual:
        '`[(ngModel)]`, `*ngIf`, `#inputRef`, `id`, `class`, `(output)`, `[binding]`',
    },
    annotatedOutput: `
      <input
        *ngIf="flag"
        
        #inputRef
        
        id="input"
        
        class="className"
        
        [binding]="true"
        
        [(ngModel)]="model"
        
        (output)="handleOutput($event)">
        
    `,
  }),
];
