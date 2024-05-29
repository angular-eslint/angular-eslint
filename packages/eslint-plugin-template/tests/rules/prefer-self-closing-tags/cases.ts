import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import { MESSAGE_ID as messageId } from '../../../src/rules/prefer-self-closing-tags';

export const valid = [
  '<my-component type="text" [name]="foo">With some content</my-component>',
  '<my-component />',
  `
    <my-component
      type="text"
      [name]="foo"
      [items]="items" />
  `,
  '<img />',
  '<div></div>',
  '<ng-template/>',
  '<ng-template>Content</ng-template>',
  '<ng-content/>',
  '<ng-content select="my-selector" />',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if an element has a closing tag but no content',
    annotatedSource: `
      <my-component></my-component>
                    ~~~~~~~~~~~~~~~
    `,
    messageId,
    annotatedOutput: `
      <my-component />
                    
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if an element with attributes has a closing tag but no content',
    annotatedSource: `
      <my-component type="text" [name]="foo"></my-component>
                                             ~~~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component type="text" [name]="foo" />
                                             
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if a multiline element has a closing tag but no content',
    annotatedSource: `
      <my-component
        type="text"
        [name]="foo"
        [items]="items">
      </my-component>
      ~~~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component
        type="text"
        [name]="foo"
        [items]="items" />
      
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if the opening and closing tag are on the same new line',
    annotatedSource: `
      <my-component
        type="text"
        [name]="foo"
        [items]="items"
      ></my-component>
       ~~~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <my-component
        type="text"
        [name]="foo"
        [items]="items"
      />
       
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail on ng-template elements',
    annotatedSource: `
      <ng-template></ng-template>
                   ~~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <ng-template />
                   
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail on ng-template elements with white spaces',
    annotatedSource: `
      <ng-template> </ng-template>
                    ~~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <ng-template />
                    
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail on ng-content elements',
    annotatedSource: `
      <ng-content></ng-content>
                  ~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <ng-content />
                  
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail on ng-content elements with selector',
    annotatedSource: `
      <ng-content
        selector="my-selector"
      ></ng-content>
       ~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <ng-content
        selector="my-selector"
      />
       
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail on ng-content elements with a line break',
    annotatedSource: `
      <ng-content>
      </ng-content>
      ~~~~~~~~~~~~~
    `,
    annotatedOutput: `
      <ng-content />
      
    `,
    messageId,
  }),
];
