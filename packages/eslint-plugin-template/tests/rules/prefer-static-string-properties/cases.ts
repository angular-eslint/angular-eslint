import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-static-string-properties';

const messageId: MessageIds = 'preferStaticStringProperties';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<my-component [name]="foo"/>',
  '<my-component [name]="42"/>',
  '<my-component [name]="true"/>',
  '<my-component [name]="null"/>',
  '<my-component [name]="undefined"/>',
  '<my-component name="foo"/>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if literal string is bound to property',
    annotatedSource: `
      <my-component [name]="'foo'"/>
                    ~~~~~~~~~~~~~~
    `,
    messageId,
    annotatedOutput: `
      <my-component name="foo"/>
                    
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should remove whitespace around the value',
    annotatedSource: `
      <my-component [name]="   'foo'   "/>
                    ~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    annotatedOutput: `
      <my-component name="foo"/>
                    
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should handle double-quoted string literal',
    annotatedSource: `
      <my-component [name]=' "foo" '/>
                    ~~~~~~~~~~~~~~~~
    `,
    messageId,
    annotatedOutput: `
      <my-component name='foo'/>
                    
    `,
  }),
];
