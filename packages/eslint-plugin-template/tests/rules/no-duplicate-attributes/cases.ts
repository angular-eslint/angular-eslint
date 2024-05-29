import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/no-duplicate-attributes';

const messageId: MessageIds = 'noDuplicateAttributes';
const suggestRemoveAttribute: MessageIds = 'suggestRemoveAttribute';

export const valid = [
  '<input name="foo">',
  '<input [name]="foo">',
  '<input (change)="bar()">',
  '<input [(ngModel)]="foo">',
  '<input [(ngModel)]="model" (ngModelChange)="modelChanged()">',
  '<div (@fade.start)="animationStarted($event)" (@fade.done)="animationDone($event)"></div>',
  '<div (window:keydown)="windowKeydown($event)" (document:keydown)="documentKeydown($event)" (document:keyup)="documentKeyup($event)" (keyup)="keyup($event)" (keydown)="keydown($event)"></div>',
  '<div [style.width.px]="col.width" [width]="col.width"></div>',
  '<button [class.disabled]="!enabled" [disabled]="!enabled"></button>',
  '<button [@.disabled]="!enabled" [.disabled]="!enabled"></button>',
  '<div [style.width]="col.width + \'px\'" [width]="col.width"></div>',
  {
    code: `
      <div class="foo" name="bar" [class]="dynamic"></div>
    `,
    options: [{ allowStylePrecedenceDuplicates: true }],
  },
  {
    code: `
      <div style="color: blue" [style]="styleExpression"></div>
    `,
    options: [{ allowStylePrecedenceDuplicates: true }],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with 2 inputs with the same name',
    annotatedSource: `
        <input [name]="foo" [name]="bar">
               ~~~~~~~~~~~~ ^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="bar">
                            
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo">
                            
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with an input and a text attribute with the same name',
    annotatedSource: `
        <input [name]="foo" name="bar">
               ~~~~~~~~~~~~ ^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input name="bar">
                            
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo">
                            
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with 2 text attributes with the same name',
    annotatedSource: `
        <input name="foo" name="bar">
               ~~~~~~~~~~ ^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input name="bar">
                          
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input name="foo">
                          
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with 2 outputs with the same name',
    annotatedSource: `
        <input (change)="foo($event)" (change)="bar($event)">
               ~~~~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'change' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (change)="bar($event)">
                                      
      `,
            data: { attributeName: 'change' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'change' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (change)="foo($event)">
                                      
      `,
            data: { attributeName: 'change' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with 2 banana in a box with the same name',
    annotatedSource: `
        <input [(ngModel)]="model" [(ngModel)]="otherModel">
               ~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'ngModel' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [(ngModel)]="otherModel">
                                   
      `,
            data: { attributeName: 'ngModel' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'ngModel' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [(ngModel)]="model">
                                   
      `,
            data: { attributeName: 'ngModel' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with duplicate attributes but allow non duplicates',
    annotatedSource: `
        <input [name]="foo" [other]="bam" [name]="bar">
               ~~~~~~~~~~~~               ^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [other]="bam" [name]="bar">
                                          
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo" [other]="bam">
                                          
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with 3 duplications',
    annotatedSource: `
        <input [name]="foo" [name]="bar" [name]="bam">
               ~~~~~~~~~~~~ ^^^^^^^^^^^^ ############
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="bar" [name]="bam">
                                         
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo" [name]="bam">
                                         
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '#',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo" [name]="bar">
                                         
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail multiple combinations of duplicates',
    annotatedSource: `
        <input [(ngModel)]="model" [name]="foo" [(ngModel)]="otherModel" name="bar">
               ~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^ ######################## %%%%%%%%%%
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'ngModel' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo" [(ngModel)]="otherModel" name="bar">
                                                                         
      `,
            data: { attributeName: 'ngModel' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [(ngModel)]="model" [(ngModel)]="otherModel" name="bar">
                                                                         
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '#',
        messageId,
        data: { attributeName: 'ngModel' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [(ngModel)]="model" [name]="foo" name="bar">
                                                                         
      `,
            data: { attributeName: 'ngModel' },
          },
        ],
      },
      {
        char: '%',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [(ngModel)]="model" [name]="foo" [(ngModel)]="otherModel">
                                                                         
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with multiple animation outputs',
    annotatedSource: `
        <input (@fade.start)="animationStarted($event)" (@fade.start)="animationStarted($event)">
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: '@fade.start' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (@fade.start)="animationStarted($event)">
                                                        
      `,
            data: { attributeName: '@fade.start' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: '@fade.start' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (@fade.start)="animationStarted($event)">
                                                        
      `,
            data: { attributeName: '@fade.start' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail with multiple outputs on the window',
    annotatedSource: `
        <input (window:resize)="windowResized($event)" (resize)="resize()" (window:resize)="windowResized2($event)">
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'window:resize' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (resize)="resize()" (window:resize)="windowResized2($event)">
                                                                           
      `,
            data: { attributeName: 'window:resize' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'window:resize' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (window:resize)="windowResized($event)" (resize)="resize()">
                                                                           
      `,
            data: { attributeName: 'window:resize' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'not allow two way binding and output with the change event',
    annotatedSource: `
        <input [(ngModel)]="model" (ngModelChange)="modelChanged()">
               ~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      `,
    options: [{ allowTwoWayDataBinding: false }],
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'ngModelChange' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input (ngModelChange)="modelChanged()">
                                   
      `,
            data: { attributeName: 'ngModelChange' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'ngModelChange' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [(ngModel)]="model">
                                   
      `,
            data: { attributeName: 'ngModelChange' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should not report ignored properties',
    annotatedSource: `
        <input [name]="foo" class="css-static" name="bar" [class]="dynamic">
               ~~~~~~~~~~~~                    ^^^^^^^^^^
      `,
    options: [{ ignore: ['class'] }],
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input class="css-static" name="bar" [class]="dynamic">
                                               
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'name' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [name]="foo" class="css-static" [class]="dynamic">
                                               
      `,
            data: { attributeName: 'name' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should report duplicate static binding for class attribute',
    annotatedSource: `
        <input class="foo" class="bar" [class]="dynamic">
               ~~~~~~~~~~~ ^^^^^^^^^^^     
      `,
    options: [{ allowStylePrecedenceDuplicates: true }],
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'class' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input class="bar" [class]="dynamic">
                                
      `,
            data: { attributeName: 'class' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'class' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input class="foo" [class]="dynamic">
                                
      `,
            data: { attributeName: 'class' },
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should report duplicate static binding for style attribute',
    annotatedSource: `
        <input style="color: blue" [style]="styleExpression" style="width:50px">
               ~~~~~~~~~~~~~~~~~~~                           ^^^^^^^^^^^^^^^^^^
      `,
    options: [{ allowStylePrecedenceDuplicates: true }],
    messages: [
      {
        char: '~',
        messageId,
        data: { attributeName: 'style' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input [style]="styleExpression" style="width:50px">
                                                             
      `,
            data: { attributeName: 'style' },
          },
        ],
      },
      {
        char: '^',
        messageId,
        data: { attributeName: 'style' },
        suggestions: [
          {
            messageId: suggestRemoveAttribute,
            output: `
        <input style="color: blue" [style]="styleExpression">
                                                             
      `,
            data: { attributeName: 'style' },
          },
        ],
      },
    ],
  }),
];
