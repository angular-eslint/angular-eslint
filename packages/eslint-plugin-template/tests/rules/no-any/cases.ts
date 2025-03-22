import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-any';

const messageId: MessageIds = 'noAny';
const suggestRemoveAny: MessageIds = 'suggestRemoveAny';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
      {{ $any }}
    `,
  `
      {{ obj.$any() }}
    `,
  `
      {{ obj?.x?.y!.z!.$any() }}
    `,
  `
      {{ obj[read][$any] }}
    `,
  `
      {{ $any['test'] }}
    `,
  `
      {{ obj['test'].$any }}
    `,
  `
      {{ obj['test'].$any() }}
    `,
  `
      {{ obj.$any()['test'] }}
    `,
  `
      <a [href]="$test()">Click here</a>
    `,
  `
      <button type="button" (click)="anyClick()">Click here</button>
    `,
  `
      {{ $any }}
      {{ obj?.x?.y!.z!.$any() }}
      <a [href]="$test()">Click here</a>
      <button type="button" (click)="anyClick()">Click here</button>
    `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail with call expression in expression binding',
    annotatedSource: `
        {{ $any(framework).name }}
           ~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        {{ framework.name }}
           
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail with call expression using "this"',
    annotatedSource: `
        {{ this.$any(framework).name }}
           ~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        {{ this.framework.name }}
           
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail with call expression in property binding',
    annotatedSource: `
        <a [href]="$any(getHref())">Click here</a>
                   ~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        <a [href]="getHref()">Click here</a>
                   
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail with call expression and square bracket notation in property binding',
    annotatedSource: `
        <div *ngIf="$any(attributeList)['NPSScore']">Content</div>
                    ~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        <div *ngIf="attributeList['NPSScore']">Content</div>
                    
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail with call expression and square bracket notation in interpolation',
    annotatedSource: `
        <div>{{ $any(attributeList)['NPSScore'] }}</div>
                ~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        <div>{{ attributeList['NPSScore'] }}</div>
                
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail with call expression, square bracket notation and this in interpolation',
    annotatedSource: `
        <div>{{ this.$any(attributeList)['NPSScore'] }}</div>
                ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        <div>{{ this.attributeList['NPSScore'] }}</div>
                
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail with call expression and square bracket notation in interpolation with multiple nested reads',
    annotatedSource: `
        <div>{{ $any(attributeList)['NPSScore']['another'] }}</div>
                ~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveAny,
        output: `
        <div>{{ attributeList['NPSScore']['another'] }}</div>
                
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail for multiple cases',
    annotatedSource: `
        {{ $any(framework).name }}
           ~~~~~~~~~~~~~~~
        <div>
          {{ this.$any(framework).name }}
             ^^^^^^^^^^^^^^^^^^^^
        </div>
        <a [href]="$any(getHref())">Click here</a>'
                   ###############
      `,
    messages: [
      {
        char: '~',
        messageId,
        suggestions: [
          {
            messageId: suggestRemoveAny,
            output: `
        {{ framework.name }}
                          
        <div>
          {{ this.$any(framework).name }}
                                 
        </div>
        <a [href]="$any(getHref())">Click here</a>'
                   
      `,
          },
        ],
      },
      {
        char: '^',
        messageId,
        suggestions: [
          {
            messageId: suggestRemoveAny,
            output: `
        {{ $any(framework).name }}
                          
        <div>
          {{ this.framework.name }}
                                 
        </div>
        <a [href]="$any(getHref())">Click here</a>'
                   
      `,
          },
        ],
      },
      {
        char: '#',
        messageId,
        suggestions: [
          {
            messageId: suggestRemoveAny,
            output: `
        {{ $any(framework).name }}
                          
        <div>
          {{ this.$any(framework).name }}
                                 
        </div>
        <a [href]="getHref()">Click here</a>'
                   
      `,
          },
        ],
      },
    ],
  }),
];
