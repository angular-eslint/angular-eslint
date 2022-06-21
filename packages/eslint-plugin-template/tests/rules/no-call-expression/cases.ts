import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-call-expression';

const messageId: MessageIds = 'noCallExpression';

export const valid = [
  '{{ info }}',
  '<button type="button" (click)="handleClick()">Click Here</button>',
  '{{ $any(info) }}',
  '<input (change)="obj?.changeHandler()">',
  '<form [formGroup]="form" (ngSubmit)="form.valid || save()"></form>',
  '<form [formGroup]="form" (ngSubmit)="form.valid && save()"></form>',
  '<form [formGroup]="form" (ngSubmit)="id ? save() : edit()"></form>',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `FunctionCall` within `Interpolation`',
    annotatedSource: `
        <div>{{ getInfo()() }}</div>
                ~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `MethodCall` within `TextAttribute`',
    annotatedSource: `
        <a href="{{ getUrls().user }}"></a>
                    ~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for `SafeMethodCall` within `BoundAttribute`',
    annotatedSource: `
        <p [test]="test?.getInfo()"></p>
                   ~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for `FunctionCall`, `MethodCall` and `SafeMethodCall` within `Binary`',
    annotatedSource: `
        <a [href]="id && createUrl() && test()($any)">info</a>
                         ~~~~~~~~~~~    ^^^^^^^^^^^^
        {{ id || obj?.nested1() }}
                 ##############
      `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for `FunctionCall`, `MethodCall` and `SafeMethodCall` within `Conditional`',
    annotatedSource: `
        <a [href]="id ? a?.createUrl() : editUrl(3)">info</a>
                        ~~~~~~~~~~~~~~   ^^^^^^^^^^
        {{ 1 === 2 ? 3 : obj?.nested1()() }}
                         ################
      `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for safe/unsafe calls',
    annotatedSource: `
        {{ obj?.nested1() }} {{ obj!.nested1() }}
           ~~~~~~~~~~~~~~       ^^^^^^^^^^^^^^
        <button [type]="obj!.$any(b)!.getType()()">info</button>
                        #########################
        <a [href]="obj.propertyA?.href()">info</a>
                   %%%%%%%%%%%%%%%%%%%%%
      `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
      { char: '%', messageId },
    ],
  }),
];
