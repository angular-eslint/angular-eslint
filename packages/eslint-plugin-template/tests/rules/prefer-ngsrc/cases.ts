import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-ngsrc';

const missingAttribute: MessageIds = 'missingAttribute';
const invalidDoubleSource: MessageIds = 'invalidDoubleSource';
const suggestReplaceWithNgSrc: MessageIds = 'suggestReplaceWithNgSrc';
const suggestRemoveSrc: MessageIds = 'suggestRemoveSrc';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  '<img alt="nothing">',
  '<img ngSrc="http://localhost">',
  '<img [ngSrc]="\'http://localhost\'">',
  '<img [ngSrc]="value">',
  {
    code: '<IMG [ngSrc]="value">',
    settings: {
      hideFromDocs: true,
    },
  },
  '<img src="data:image/jpeg;base64">',
  `<img [src]="'data:image/jpeg;base64'">`,
  `<img [src]="'data:' + value">`,
  `<img [attr.src]="'data:image/jpeg;base64'">`,
  `<img [attr.src]="'data:' + value">`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has src attribute without ngSrc',
    annotatedSource: `
      <img src="http://localhost">
           ~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img ngSrc="http://localhost">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has src attribute with src.com URL',
    annotatedSource: `
      <img src="http://src.com">
           ~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img ngSrc="http://src.com">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has bound [src] with string literal',
    annotatedSource: `
      <img [src]="'http://localhost'">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img [ngSrc]="'http://localhost'">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has bound [src] with variable',
    annotatedSource: `
      <img [src]="value">
           ~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img [ngSrc]="value">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has [attr.src] with variable',
    annotatedSource: `
      <img [attr.src]="value">
           ~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img [ngSrc]="value">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has [attr.src] with string literal',
    annotatedSource: `
      <img [attr.src]="'http://localhost'">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img [ngSrc]="'http://localhost'">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has bound [src] with concatenation',
    annotatedSource: `
      <img [src]="'http://' + value">
           ~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img [ngSrc]="'http://' + value">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when IMG (uppercase) has bound [src]',
    annotatedSource: `
      <IMG [src]="value">
           ~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <IMG [ngSrc]="value">
           
    `,
      },
    ],
    settings: {
      hideFromDocs: true,
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has both ngSrc and src attributes',
    annotatedSource: `
      <img ngSrc="http://localhost" src="http://localhost">
                                    ~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img ngSrc="http://localhost">
                                    
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has both ngSrc and src with src.com URL',
    annotatedSource: `
      <img ngSrc="http://src.com" src="http://src.com">
                                  ~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img ngSrc="http://src.com">
                                  
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has ngSrc and bound [src] with string',
    annotatedSource: `
      <img ngSrc="http://localhost" [src]="'http://localhost'">
                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img ngSrc="http://localhost">
                                    
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has ngSrc and bound [src] with variable',
    annotatedSource: `
      <img ngSrc="http://localhost" [src]="value">
                                    ~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img ngSrc="http://localhost">
                                    
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has bound [ngSrc] and src attribute',
    annotatedSource: `
      <img [ngSrc]="otherValue" src="http://localhost">
                                ~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
                                
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when img has bound [ngSrc] and bound [src] with string',
    annotatedSource: `
      <img [ngSrc]="otherValue" [src]="'http://localhost'">
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
                                
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when img has bound [ngSrc] and bound [src] with variable',
    annotatedSource: `
      <img [ngSrc]="otherValue" [src]="value">
                                ~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
                                
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has [src] before [ngSrc]',
    annotatedSource: `
      <img [src]="otherValue" [ngSrc]="value">
           ~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="value">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has data string in src and [ngSrc]',
    annotatedSource: `
      <img src="data:image/png;base64" [ngSrc]="otherValue">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has [attr.src] data string and [ngSrc]',
    annotatedSource: `
      <img [attr.src]="'data:image/png;base64'" [ngSrc]="otherValue">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when img has [src] data string and [ngSrc]',
    annotatedSource: `
      <img [src]="'data:image/png;base64'" [ngSrc]="otherValue">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when img has bound [src] data concatenation and [ngSrc]',
    annotatedSource: `
      <img [src]="'data:' + value" [ngSrc]="otherValue">
           ~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img [ngSrc]="otherValue">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should correctly replace src attribute when it is on a new line',
    annotatedSource: `
      <img
        src="http://localhost">
        ~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img
        ngSrc="http://localhost">
        
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should correctly replace [src] when it is on new line with other attributes',
    annotatedSource: `
      <img
        [src]="value"
        ~~~~~~~~~~~~~
        alt="test">
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img
        [ngSrc]="value"
        
        alt="test">
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should correctly replace [attr.src] when it is on a new line with other attributes',
    annotatedSource: `
      <img
        [attr.src]="value"
        ~~~~~~~~~~~~~~~~~~
        width="100">
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img
        [ngSrc]="value"
        
        width="100">
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should correctly remove src when multiline img has both ngSrc and src',
    annotatedSource: `
      <img
        ngSrc="http://localhost"
        src="http://localhost">
        ~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img
        ngSrc="http://localhost">
        
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should correctly remove src when multiline img has both [ngSrc] and [src] with other attributes',
    annotatedSource: `
      <img
        [ngSrc]="otherValue"
        [src]="value"
        ~~~~~~~~~~~~~
        alt="test">
    `,
    messageId: invalidDoubleSource,
    suggestions: [
      {
        messageId: suggestRemoveSrc,
        output: `
      <img
        [ngSrc]="otherValue"
        
        alt="test">
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should correctly replace [src] in img with dangling closing bracket',
    annotatedSource: `
      <img alt="test"
        [src]="value"
        ~~~~~~~~~~~~~
      >
    `,
    messageId: missingAttribute,
    suggestions: [
      {
        messageId: suggestReplaceWithNgSrc,
        output: `
      <img alt="test"
        [ngSrc]="value"
        
      >
    `,
      },
    ],
  }),
];
