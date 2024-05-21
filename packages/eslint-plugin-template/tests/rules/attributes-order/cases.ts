import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import {
  OrderType,
  type MessageIds,
} from '../../../src/rules/attributes-order';

const messageId: MessageIds = 'attributesOrder';

export const valid = [
  `<input class="card" [value]="foo" (valueChange)="handleValueChange($event)">`,
  `<input *ngIf="flag" #inputRef id="input" class="className" [binding]="true" [(ngModel)]="model" (output)="handleOutput($event)">`,
  `<input *ngIf="flag" (output)="handleOutput($event)">`,
  '<input *ngIf="flag" required>',
  `<input [(ngModel)]="model">`,
  '<input [(ngModel)]="model" (ngModelChange)="onChange($event)">',
  '<ng-template></ng-template>',
  '<ng-template #Template><div></div></ng-template>',
  '<ng-template [ngIf]="condition" [ngIfThen]="If" [ngIfElse]="Else"><div></div></ng-template>',
  '<ng-template #Template let-value><div></div></ng-template>',
  '<div i18n test1="test1" i18n-test1="@@TEST1" test2="test2" i18n-test2="@@TEST2"></div>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for simple attributes',
    annotatedSource: `
      <li><input type="text" id="input"></li>
                 ~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [
      {
        alphabetical: true,
      },
    ],
    data: {
      expected: '`id`, `type`',
      actual: '`type`, `id`',
    },
    annotatedOutput: `
      <li><input id="input" type="text"></li>
                 
    `,
  }),
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
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for ngFor',
    annotatedSource: `
      <ng-container (click)="bar = []" id="issue" *ngFor="let foo of bar"></ng-container>
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`*ngFor`, `id`, `(click)`',
      actual: '`(click)`, `id`, `*ngFor`',
    },
    annotatedOutput: `
      <ng-container *ngFor="let foo of bar" id="issue" (click)="bar = []"></ng-container>
                    
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for ngFor with let',
    annotatedSource: `
      <ng-container (click)="bar = []" id="issue" *ngFor="let foo of bar; index as i; first as isFirst"></ng-container>
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`*ngFor`, `id`, `(click)`',
      actual: '`(click)`, `id`, `*ngFor`',
    },
    annotatedOutput: `
      <ng-container *ngFor="let foo of bar; index as i; first as isFirst" id="issue" (click)="bar = []"></ng-container>
                    
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for ngIf as',
    annotatedSource: `
      <div id="id" *ngIf="bar as foo"></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`*ngIf`, `id`',
      actual: '`id`, `*ngIf`',
    },
    annotatedOutput: `
      <div *ngIf="bar as foo" id="id"></div>
           
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for ngIfThenElse',
    annotatedSource: `
      <div id="id" *ngIf="condition then foo else bar"></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`*ngIf`, `id`',
      actual: '`id`, `*ngIf`',
    },
    annotatedOutput: `
      <div *ngIf="condition then foo else bar" id="id"></div>
           
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work for dotted attributes',
    annotatedSource: `
      <div [disabled]="disabled" [class.disabled]="disabled"></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`[class.disabled]`, `[disabled]`',
      actual: '`[disabled]`, `[class.disabled]`',
    },
    annotatedOutput: `
      <div [class.disabled]="disabled" [disabled]="disabled"></div>
           
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work with ng-template',
    annotatedSource: `
      <ng-template let-value #Template></ng-template>
                   ~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`#Template`, `let-value`',
      actual: '`let-value`, `#Template`',
    },
    annotatedOutput: `
      <ng-template #Template let-value></ng-template>
                   
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should work with ng-template with multiple variable assignments',
    annotatedSource: `
      <ng-template let-value="something" let-anotherValue="else" #Template></ng-template>
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`#Template`, `let-anotherValue`, `let-value`',
      actual: '`let-value`, `let-anotherValue`, `#Template`',
    },
    annotatedOutput: `
      <ng-template #Template let-anotherValue="else" let-value="something"></ng-template>
                   
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should work with structural directive and single let',
    annotatedSource: `
      <td mat-cell *matCellDef="let element"></td>
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`*matCellDef`, `mat-cell`',
      actual: '`mat-cell`, `*matCellDef`',
    },
    annotatedOutput: `
      <td *matCellDef="let element" mat-cell></td>
          
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should work with structural directive and single let spread over lines',
    annotatedSource: `
      <td mat-cell *matCellDef="
          ~~~~~~~~~~~~~~~~~~~~~~
        let element
        ~~~~~~~~~~~
      "></td>
      ~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`*matCellDef`, `mat-cell`',
      actual: '`mat-cell`, `*matCellDef`',
    },
    annotatedOutput: `
      <td *matCellDef="
          
        let element
        
      " mat-cell></td>
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should work with structural directive with as and trailing whitespace',
    annotatedSource: `
      <div class="abc" *ngIf="sth.property as property "></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`*ngIf`, `class`',
      actual: '`class`, `*ngIf`',
    },
    annotatedOutput: `
      <div *ngIf="sth.property as property " class="abc"></div>
           
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: `should work with valueless structural directive at beginning`,
    annotatedSource: `
      <div *structuralDirective class="abc"></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [
      {
        alphabetical: true,
        order: [
          OrderType.AttributeBinding,
          OrderType.TemplateReferenceVariable,
          OrderType.InputBinding,
          OrderType.OutputBinding,
          OrderType.TwoWayBinding,
          OrderType.StructuralDirective,
        ],
      },
    ],
    data: {
      expected: '`class`, `*structuralDirective`',
      actual: '`*structuralDirective`, `class`',
    },
    annotatedOutput: `
      <div class="abc" *structuralDirective></div>
           
    `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should work with valueless structural directive with no value in middle',
    annotatedSource: `
      <div title="abc" *structuralDirective abbr="abc"></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    options: [{ alphabetical: true }],
    data: {
      expected: '`*structuralDirective`, `abbr`, `title`',
      actual: '`title`, `*structuralDirective`, `abbr`',
    },
    annotatedOutput: `
      <div *structuralDirective abbr="abc" title="abc"></div>
           
    `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should work with valueless structural directive with no value at end',
    annotatedSource: `
      <div class="abc" *structuralDirective></div>
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    data: {
      expected: '`*structuralDirective`, `class`',
      actual: '`class`, `*structuralDirective`',
    },
    annotatedOutput: `
      <div *structuralDirective class="abc"></div>
           
    `,
  }),
];
