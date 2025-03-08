import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-template-literal';
import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';

const messageId: MessageIds = 'preferTemplateLiteral';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '{{ `prefix-${value}-suffix` }}',
  '{{ 42 + 42 }}',
  '{{ value + value2 }}',
  '{{ value() + value2() }}',
  "{{ 'text' | pipe }}",
  '@if (`prefix-${value}-suffix`) {}',
  '@defer (when `prefix-${value}-suffix`) {}',
  '<h1>{{ `prefix-${value}-suffix` }}</h1>',
  '<my-component [class]="`prefix-${value}-suffix`"></my-component>',
  '<my-component *directive="`prefix-${value}-suffix` | pipe" />',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: static string)',
    annotatedSource: `
        {{ 'prefix-' + '-suffix' }}
           ~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'prefix--suffix' }}
           
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: template)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + \`-prefix2-\${value2}-suffix2\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix-prefix2-\${value2}-suffix2\` }}
           
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation with binding attribute',
    annotatedSource: `
        <my-component [class]="'prefix-' + myClass | pipe"></my-component>
                               ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        <my-component [class]="\`prefix-\${myClass}\` | pipe"></my-component>
                               
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation with if and pipe',
    annotatedSource: `
        @if (value() + '-suffix' | pipe) {}
             ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        @if (\`\${value()}-suffix\` | pipe) {}
             
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation with defer',
    annotatedSource: `
        @defer (when value() + '-suffix' | pipe) {}
                     ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        @defer (when \`\${value()}-suffix\` | pipe) {}
                     
      `,
  }),

  // Left : static string
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: number)',
    annotatedSource: `
        {{ 'prefix-' + 42 }}
           ~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'prefix-42' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: static string, right: null)',
    annotatedSource: `
        {{ 'prefix-' + null }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'prefix-null' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: undefined)',
    annotatedSource: `
        {{ 'prefix-' + undefined }}
           ~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'prefix-undefined' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: boolean)',
    annotatedSource: `
        {{ 'prefix-' + true }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'prefix-true' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: property read)',
    annotatedSource: `
        {{ 'prefix-' + value }}
           ~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: static string, right: call)',
    annotatedSource: `
        {{ 'prefix-' + value() }}
           ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value()}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: array)',
    annotatedSource: `
        {{ 'prefix-' + [42] }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${[42]}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: static string, right: template)',
    annotatedSource: `
        {{ 'prefix-' + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-prefix-\${value}-suffix\` }}
           
      `,
  }),

  // Right : static string
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: number, right: static string)',
    annotatedSource: `
        {{ 42 + '-suffix' }}
           ~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ '42-suffix' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: null, right: static string)',
    annotatedSource: `
        {{ null + '-suffix' }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'null-suffix' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: undefined, right: static string)',
    annotatedSource: `
        {{ undefined + '-suffix' }}
           ~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'undefined-suffix' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: boolean, right: static string)',
    annotatedSource: `
        {{ true + '-suffix' }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'true-suffix' }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: property read, right: static string)',
    annotatedSource: `
        {{ value + '-suffix' }}
           ~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: call, right: static string)',
    annotatedSource: `
        {{ value() + '-suffix' }}
           ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${value()}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: array, right: static string)',
    annotatedSource: `
        {{ [42] + '-suffix' }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${[42]}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: template, right: static string)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + '-suffix' }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix-suffix\` }}
           
      `,
  }),
];
