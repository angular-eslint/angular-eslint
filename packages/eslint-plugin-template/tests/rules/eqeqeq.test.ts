import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/eqeqeq';
import rule, { RULE_NAME } from '../../src/rules/eqeqeq';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});
const messageId: MessageIds = 'eqeqeq';
const suggestStrictEquality: MessageIds = 'suggestStrictEquality';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '{{ a === 1 }}',
    `<div [class.testing]="b === false">`,
    '<div *ngIf="c === test">',
    {
      code: `
        <div *appShow="(d == null && e === null && (f | lowercase) == undefined) || g === undefined">
      `,
      options: [{ allowNullOrUndefined: true }],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within interpolation',
      annotatedSource: `
        {{ 'null' == test }}
           ~~~~~~~~~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '==',
        expectedOperation: '===',
      },
      annotatedOutput: `
        {{ 'null' === test }}
           ~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within attribute directive',
      annotatedSource: `
        <div [attr.disabled]="test != 'undefined' && null == '3'"></div>
                              ~~~~~~~~~~~~~~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '!=',
        expectedOperation: '!==',
      },
      options: [{ allowNullOrUndefined: true }],
      annotatedOutput: `
        <div [attr.disabled]="test !== 'undefined' && null == '3'"></div>
                              ~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within structural directive',
      annotatedSource: `
        <div *ngIf="test == true || test1 !== undefined"></div>
                    ~~~~~~~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '==',
        expectedOperation: '===',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        <div *ngIf="test === true || test1 !== undefined"></div>
                    
      `,
          data: {
            actualOperation: '==',
            expectedOperation: '===',
          },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within conditional',
      annotatedSource: `
        {{ one != '02' ? c > d : 'hey!' }}
           ~~~~~~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '!=',
        expectedOperation: '!==',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        {{ one !== '02' ? c > d : 'hey!' }}
           
      `,
          data: {
            actualOperation: '!=',
            expectedOperation: '!==',
          },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within conditional (condition)',
      annotatedSource: `
        {{ a === b && 1 == b ? c > d : 'hey!' }}
                      ~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '==',
        expectedOperation: '===',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        {{ a === b && 1 === b ? c > d : 'hey!' }}
                      
      `,
          data: {
            actualOperation: '==',
            expectedOperation: '===',
          },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within conditional (trueExp)',
      annotatedSource: `
        {{ c > d ? a != b : 'hey!' }}
                   ~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '!=',
        expectedOperation: '!==',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        {{ c > d ? a !== b : 'hey!' }}
                   
      `,
          data: {
            actualOperation: '!=',
            expectedOperation: '!==',
          },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within conditional (falseExp)',
      annotatedSource: `
        {{ c > d ? 'hey!' : a == false }}
                            ~~~~~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '==',
        expectedOperation: '===',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        {{ c > d ? 'hey!' : a === false }}
                            
      `,
          data: {
            actualOperation: '==',
            expectedOperation: '===',
          },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict within recursive conditional',
      annotatedSource: `
        {{ undefined == test1 && a === b ? (c > d ? d != '0' : v === 4) : 'hey!' }}
                                                    ~~~~~~~~
      `,
      messageId,
      options: [{ allowNullOrUndefined: true }],
      data: {
        actualOperation: '!=',
        expectedOperation: '!==',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        {{ undefined == test1 && a === b ? (c > d ? d !== '0' : v === 4) : 'hey!' }}
                                                    
      `,
          data: {
            actualOperation: '!=',
            expectedOperation: '!==',
          },
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if the operation is not strict compared to literal undefined',
      annotatedSource: `
        {{ undefined != test1 }}
           ~~~~~~~~~~~~~~~~~~
      `,
      messageId,
      data: {
        actualOperation: '!=',
        expectedOperation: '!==',
      },
      suggestions: [
        {
          messageId: suggestStrictEquality,
          output: `
        {{ undefined !== test1 }}
           
      `,
          data: {
            actualOperation: '!=',
            expectedOperation: '!==',
          },
        },
      ],
    }),
  ],
});
