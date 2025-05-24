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
  "{{ 'simple-quote' | pipe }}",
  '{{ "double-quote" }}"',
  '{{ `backquote` }}',
  '@if (`prefix-${value}-suffix`) {}',
  '@defer (when `prefix-${value}-suffix`) {}',
  '@let letValue = `prefix-${value}-suffix`;',
  '<h1>{{ `prefix-${value}-suffix` }}</h1>',
  '<my-component class="prefix-{{value}}-suffix"></my-component>',
  '<my-component [class]="`prefix-${value}-suffix`"></my-component>',
  '<my-component *directive="`prefix-${value}-suffix` | pipe" />',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: simple quote, right: simple quote)',
    annotatedSource: `
        {{ 'pre"fix-' + '-suf\\'fix' }}
           ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'pre"fix--suf\\'fix' }}
           
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: double quote)',
    annotatedSource: `
        {{ "pre'fix-" + "-suf\\"fix" }}
           ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "pre'fix--suf\\"fix" }}
           
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
    description:
      'should fail concatenation (left: simple quote, right: double quote)',
    annotatedSource: `
        {{ 'pre"fix-' + "-suf'fix" }}
           ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ 'pre"fix--suf\\'fix' }}
           
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: simple quote, right: template)',
    annotatedSource: `
        {{ 'pre\`fix-' + \`'pre\\\`fix"-\${value}-"suf\\\`fix'\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`pre\\\`fix-'pre\\\`fix"-\${value}-"suf\\\`fix'\` }}
           
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: simple quote)',
    annotatedSource: `
        {{ "pre'fix-" + '-suf"fix' }}
           ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "pre'fix--suf\\"fix" }}
           
      `,
  }),

  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: template)',
    annotatedSource: `
        {{ "pre\`fix-" + \`'pre\\\`fix"-\${value}-"suf\\\`fix'\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`pre\\\`fix-'pre\\\`fix"-\${value}-"suf\\\`fix'\` }}
           
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
        @if (value() + "-suffix" | pipe) {}
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

  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation with let',
    annotatedSource: `
        @let letValue = value() + '-suffix';
                        ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        @let letValue = \`\${value()}-suffix\`;
                        
      `,
  }),

  // Left : simple quote
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: simple quote, right: number)',
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
    description: 'should fail concatenation (left: simple quote, right: null)',
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
      'should fail concatenation (left: simple quote, right: undefined)',
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
      'should fail concatenation (left: simple quote, right: boolean)',
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
      'should fail concatenation (left: simple quote, right: property read)',
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
    description: 'should fail concatenation (left: simple quote, right: call)',
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
    description: 'should fail concatenation (left: simple quote, right: array)',
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
      'should fail concatenation (left: simple quote, right: ternary in parentheses)',
    annotatedSource: `
        {{ 'prefix-' + (condition ? 'true' : 'false') }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${condition ? 'true' : 'false'}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: simple quote, right: pipe in parentheses)',
    annotatedSource: `
        {{ 'prefix-' + ('value' | pipe) }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${'value' | pipe}\` }}
           
      `,
  }),

  // Left : double quote
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: number)',
    annotatedSource: `
        {{ "prefix-" + 42 }}
           ~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "prefix-42" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: double quote, right: null)',
    annotatedSource: `
        {{ "prefix-" + null }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "prefix-null" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: undefined)',
    annotatedSource: `
        {{ "prefix-" + undefined }}
           ~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "prefix-undefined" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: boolean)',
    annotatedSource: `
        {{ "prefix-" + true }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "prefix-true" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: property read)',
    annotatedSource: `
        {{ "prefix-" + value }}
           ~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: double quote, right: call)',
    annotatedSource: `
        {{ "prefix-" + value() }}
           ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value()}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: double quote, right: array)',
    annotatedSource: `
        {{ "prefix-" + [42] }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${[42]}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: ternary in parentheses)',
    annotatedSource: `
        {{ 'prefix-' + (condition ? 'true' : 'false') }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${condition ? 'true' : 'false'}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: double quote, right: pipe in parentheses)',
    annotatedSource: `
        {{ 'prefix-' + ('value' | pipe) }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${'value' | pipe}\` }}
           
      `,
  }),

  // Left : template
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: number)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + 42 }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix42\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: null)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + null }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffixnull\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: undefined)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + undefined }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffixundefined\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: boolean)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + false }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffixfalse\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: template, right: property read)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + value2 }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix\${value2}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: call)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + value2() }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix\${value2()}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: template, right: array)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + [42] }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix\${[42]}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: template, right: ternary in parentheses)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + (condition ? 'true' : 'false') }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix\${condition ? 'true' : 'false'}\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: template, right: pipe in parentheses)',
    annotatedSource: `
        {{ \`prefix-\${value}-suffix\` + ('value' | pipe) }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`prefix-\${value}-suffix\${'value' | pipe}\` }}
           
      `,
  }),

  // Right : simple quote
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: number, right: simple quote)',
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
    description: 'should fail concatenation (left: null, right: simple quote)',
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
      'should fail concatenation (left: undefined, right: simple quote)',
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
      'should fail concatenation (left: boolean, right: simple quote)',
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
      'should fail concatenation (left: property read, right: simple quote)',
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
    description: 'should fail concatenation (left: call, right: simple quote)',
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
    description: 'should fail concatenation (left: array, right: simple quote)',
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
      'should fail concatenation (left: template, right: simple quote)',
    annotatedSource: `
        {{ \`'pre\\\`fix"-\${value}-"suf\\\`fix'\` + '-suf\`fix' }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`'pre\\\`fix"-\${value}-"suf\\\`fix'-suf\\\`fix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: ternary in parentheses, right: simple quote)',
    annotatedSource: `
        {{ (condition ? 'true' : 'false') + '-suffix' }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${condition ? 'true' : 'false'}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: pipe in parentheses, right: simple quote)',
    annotatedSource: `
        {{ ('value' | pipe) + '-suffix' }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${'value' | pipe}-suffix\` }}
           
      `,
  }),

  // Right : double quote
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: number, right: double quote)',
    annotatedSource: `
        {{ 42 + "-suffix" }}
           ~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "42-suffix" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: null, right: double quote)',
    annotatedSource: `
        {{ null + "-suffix" }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "null-suffix" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: undefined, right: double quote)',
    annotatedSource: `
        {{ undefined + "-suffix" }}
           ~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "undefined-suffix" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: boolean, right: double quote)',
    annotatedSource: `
        {{ true + "-suffix" }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ "true-suffix" }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: property read, right: double quote)',
    annotatedSource: `
        {{ value + "-suffix" }}
           ~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: call, right: double quote)',
    annotatedSource: `
        {{ value() + "-suffix" }}
           ~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${value()}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: array, right: double quote)',
    annotatedSource: `
        {{ [42] + "-suffix" }}
           ~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${[42]}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: template, right: double quote)',
    annotatedSource: `
        {{ \`'pre\\\`fix"-\${value}-"suf\\\`fix'\` + "-suf\`fix" }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`'pre\\\`fix"-\${value}-"suf\\\`fix'-suf\\\`fix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: ternary in parentheses, right: double quote)',
    annotatedSource: `
        {{ (condition ? 'true' : 'false') + "-suffix" }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${condition ? 'true' : 'false'}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: pipe in parentheses, right: double quote)',
    annotatedSource: `
        {{ ('value' | pipe) + "-suffix" }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${'value' | pipe}-suffix\` }}
           
      `,
  }),

  // Right : template
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: number, right: template)',
    annotatedSource: `
        {{ 42 + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`42prefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: null, right: template)',
    annotatedSource: `
        {{ null + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`nullprefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: undefined, right: template)',
    annotatedSource: `
        {{ undefined + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`undefinedprefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: boolean, right: template)',
    annotatedSource: `
        {{ false + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`falseprefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: property read, right: template)',
    annotatedSource: `
        {{ value2 + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${value2}prefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: call, right: template)',
    annotatedSource: `
        {{ value2() + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${value2()}prefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fail concatenation (left: array, right: template)',
    annotatedSource: `
        {{ [42] + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${[42]}prefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: ternary in parentheses, right: template)',
    annotatedSource: `
        {{ (condition ? 'true' : 'false') + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${condition ? 'true' : 'false'}prefix-\${value}-suffix\` }}
           
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail concatenation (left: pipe in parentheses, right: template)',
    annotatedSource: `
        {{ ('value' | pipe) + \`prefix-\${value}-suffix\` }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        {{ \`\${'value' | pipe}prefix-\${value}-suffix\` }}
           
      `,
  }),

  // Test cases for reported bugs

  // Bug 1: Simple long string test case
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fix concatenation with long URL string',
    annotatedSource: `
        <a [href]="'https://example.com/very-long-url-path-that-is-quite-long' + variable">Test</a>
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        <a [href]="\`https://example.com/very-long-url-path-that-is-quite-long\${variable}\`">Test</a>
                   
      `,
  }),

  // Test cases for specific reported bugs that currently fail

  // Test case 1: Add a simple case with the actual failing 108-character string
  convertAnnotatedSourceToFailureCase({
    messageId,
    description: 'should fix exactly 108 char string (reproduces bug)',
    annotatedSource: `
        <a [href]="'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' + example">Test</a>
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    annotatedOutput: `
        <a [href]="\`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\${example}\`">Test</a>
                   
      `,
  }),

  // Test case demonstrating multiple autofix passes for chained concatenations
  // convertAnnotatedSourceToFailureCase({
  //   messageId,
  //   description:
  //     'should handle chained concatenations of literals requiring multiple autofix passes',
  //   annotatedSource: `
  //       {{ 'first' + 'second' + 'third' }}
  //          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //     `,
  //   annotatedOutputs: [
  //     // TODO: this is where we should end up for this source, but what should the interim fixes be?
  //     `
  //       {{ 'firstsecondthird' }}

  //     `,
  //   ],
  // }),
];
