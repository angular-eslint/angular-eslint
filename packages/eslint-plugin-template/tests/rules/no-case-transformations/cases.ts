import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-case-transformations';

const messageId: MessageIds = 'noCaseTransformations';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '{{ name }}',
  '{{ user.name }}',
  '<button (click)="handleClick(name.toLowerCase())">Click</button>',
  '<button (change)="onChange(value.toUpperCase())">Change</button>',
  '{{ name | lowercase }}',
  '{{ name | uppercase }}',
  '{{ getValue() }}',
  '{{ items.push(item) }}',
  '{{ text.includes("test") }}',
  {
    code: '{{ name.toLowerCase() }}',
    options: [{ disallowList: ['toUpperCase'] }],
  },
  {
    code: '<button (click)="handleClick()">Click</button>',
    options: [{ allowInOutputHandlers: false }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when toLowerCase() is used in template',
    annotatedSource: `
        {{ name.toLowerCase() }}
           ~~~~~~~~~~~~~~~~
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toLowerCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when toUpperCase() is used in template',
    annotatedSource: `
        {{ title.toUpperCase() }}
           ~~~~~~~~~~~~~~~~~
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toUpperCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when toLocaleLowerCase() is used in template',
    annotatedSource: `
        {{ text.toLocaleLowerCase() }}
           ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toLocaleLowerCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when toLocaleUpperCase() is used in template',
    annotatedSource: `
        {{ text.toLocaleUpperCase() }}
           ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toLocaleUpperCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when case transformation is used in property binding',
    annotatedSource: `
        <div [title]="name.toLowerCase()">Content</div>
                      ~~~~~~~~~~~~~~~~
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toLowerCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when case transformation is used in attribute interpolation',
    annotatedSource: `
        <div title="{{ name.toUpperCase() }}">Content</div>
                       ~~~~~~~~~~~~~~~~
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toUpperCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in output handlers when allowInOutputHandlers is false',
    annotatedSource: `
        <button (click)="handleClick(name.toLowerCase())">Click</button>
                                     ~~~~~~~~~~~~~~~~
      `,
    options: [{ allowInOutputHandlers: false }],
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toLowerCase' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should respect custom disallowList',
    annotatedSource: `
        {{ name.toUpperCase() }}
           ~~~~~~~~~~~~~~~~
      `,
    options: [{ disallowList: ['toUpperCase', 'toLowerCase'] }],
    messages: [
      {
        char: '~',
        messageId,
        data: { methodName: 'toUpperCase' },
      },
    ],
  }),
];
