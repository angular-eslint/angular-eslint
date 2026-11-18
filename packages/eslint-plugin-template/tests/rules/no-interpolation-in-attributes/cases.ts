import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-interpolation-in-attributes';

const messageId: MessageIds = 'noInterpolationInAttributes';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<input type="text" [name]="foo">',
  '<input type="text" name="foo" [(ngModel)]="foo">',
  '<input type="text" [name]="foo + \'bar\'">',
  '<input type="text" [name]="foo | bar">',
  '<div>{{ content }}</div>',
  {
    options: [{ allowSubstringInterpolation: true }],
    code: `<img class="icon icon--{{size}}" alt="{{username}} is online" src="online.png">`,
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix if interpolation is used as attribute value',
    annotatedSource: `
        <input type="text" name="{{ foo }}">
                                 ~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <input type="text" [name]="foo">
                                 
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and not autofix if interpolation is used as part of attribute value',
    annotatedSource: `
        <input type="text" name="{{ foo }}bar">
                                 ~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix the full attribute if interpolation is used as attribute value',
    annotatedSource: `
        <input type="text" attr.data-myExample="{{ foo }}">
                                                ~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <input type="text" [attr.data-myExample]="foo">
                                                
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail and not autofix when interpolation is used as part of attribute value and this is explicitly configured as disallowed',
    annotatedSource: `
        <input type="text" name="{{ foo }}bar">
                                 ~~~~~~~~~~~~
      `,
    messageId,
    options: [{ allowSubstringInterpolation: false }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix if the entire value of an attribute is an interpolation when allowSubstringInterpolation is true',
    annotatedSource: `
       <img alt="{{username}} is online" src="{{src}}">
                                              ~~~~~~~
      `,
    messageId,
    options: [{ allowSubstringInterpolation: true }],
    annotatedOutput: `
       <img alt="{{username}} is online" [src]="src">
                                              
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and not autofix if the attribute value is made of adjacent interpolations',
    annotatedSource: `
        <a href="{{ base }}{{ path }}"></a>
                 ~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix with double quotes if the attribute value uses single quotes',
    annotatedSource: `
        <img src='{{ url }}'>
                  ~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <img [src]="url">
                  
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix with single quotes if the expression contains double quotes',
    annotatedSource: `
        <img src='{{ "a" + b }}'>
                  ~~~~~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <img [src]='"a" + b'>
                  
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix with double quotes if the attribute value is unquoted',
    annotatedSource: `
        <img src={{url}}>
                 ~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <img [src]="url">
                 
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix keeping HTML entities if the expression contains them',
    annotatedSource: `
        <div title="{{ a &amp;&amp; b }}"></div>
                    ~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <div [title]="a &amp;&amp; b"></div>
                    
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix keeping &quot; entities in a single-quoted attribute value',
    annotatedSource: `
        <div title='{{ &quot;x&quot; + a }}'></div>
                    ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    annotatedOutput: `
        <div [title]="&quot;x&quot; + a"></div>
                    
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail on the whole attribute value and not autofix if the value contains HTML entities after the interpolation',
    annotatedSource: `
        <div title="{{ a }}&amp;b"></div>
                    ~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and not autofix if the opening interpolation delimiter is written as HTML entities',
    annotatedSource: `
        <div title="&#123;&#123; a }}"></div>
                    ~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and not autofix if the closing interpolation delimiter is written as HTML entities',
    annotatedSource: `
        <div title="{{ a &#125;&#125;"></div>
                    ~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
];
