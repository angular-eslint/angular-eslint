import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-call-expression';

const messageId: MessageIds = 'noCallExpression';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '{{ info }}',
  '<button type="button" (click)="handleClick()">Click Here</button>',
  '{{ $any(info) }}',
  '<input (change)="obj?.changeHandler()">',
  '<form [formGroup]="form" (ngSubmit)="form.valid || save()"></form>',
  '<form [formGroup]="form" (ngSubmit)="form.valid && save()"></form>',
  '<form [formGroup]="form" (ngSubmit)="id ? save() : edit()"></form>',
  {
    code: `
      {{ obj?.nested() }} {{ obj!.nested() }}
      <a [href]="getHref()">info</a>
      {{ $validWithPrefix() }} {{ validWithSuffix$() }}
    `,
    options: [
      {
        allowList: ['nested', 'getHref'],
        allowPrefix: '$',
        allowSuffix: '$',
      },
    ],
  },
  `
  @if (condition) {
    <div></div>
  } @else if (otherCondition) {
    <div></div>
  } @else {
    <div></div>
  }`,
  `
  @switch (condition) { 
    @case(value) {
      <div></div>
    } 
    @default {
      <div></div>
    } 
  }`,
  `
  @for (item of list; track item.id)) {
    <div></div>
  } @empty {
    <div></div>
  }`,
  `
  @defer (on viewport(ref); prefetch on viewport(ref)) {
    <div></div>
  } @error {
    <div></div>
  } @loading {
    <div></div>
  } @placeholder {
    <div></div>
  }`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for calls in @if',
    annotatedSource: `
    @if (foo()) {
         ~~~~~
      <div [id]="foo()"></div>
                 ^^^^^
    } @else if (foo()) {
                #####
      <div [id]="foo()"></div>
                 %%%%%
    } @else {
      <div [id]="foo()"></div>
                 ¶¶¶¶¶
    }`,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
      { char: '%', messageId },
      { char: '¶', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for calls in @switch',
    annotatedSource: `
    @switch (foo()) {
             ~~~~~
      @case(foo()) {
            ^^^^^
        <div [id]="foo()"></div>
                   #####
      } 
      @default {
        <div [id]="foo()"></div>
                   %%%%%
      } 
    }`,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
      { char: '%', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for calls in @for',
    annotatedSource: `
    @for (item of getFooList(); track item.getId()) {
                  ~~~~~~~~~~~~        ^^^^^^^^^^^^
      <div [id]="foo()"></div>
                 #####
    } @empty {
      <div [id]="foo()"></div>
                 %%%%%
    }`,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
      { char: '%', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for calls in @defer',
    annotatedSource: `
    @defer (when foo(); prefetch when foo()) {
                 ~~~~~                ^^^^^
      <div [id]="foo()"></div>
                 #####
    } @error {
      <div [id]="foo()"></div>
                 %%%%%
    } @loading {
      <div [id]="foo()"></div>
                 ¶¶¶¶¶
    } @placeholder {
      <div [id]="foo()"></div>
                 *****
    }`,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
      { char: '%', messageId },
      { char: '¶', messageId },
      { char: '*', messageId },
    ],
  }),
];
