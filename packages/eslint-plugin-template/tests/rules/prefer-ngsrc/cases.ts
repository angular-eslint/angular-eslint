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
  {
    code: '<img src="http://localhost">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img ngSrc="http://localhost">',
          },
        ],
      },
    ],
  },
  {
    code: '<img src="http://src.com">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img ngSrc="http://src.com">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [src]="\'http://localhost\'">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img [ngSrc]="\'http://localhost\'">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [src]="value">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img [ngSrc]="value">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [attr.src]="value">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img [ngSrc]="value">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [attr.src]="\'http://localhost\'">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img [ngSrc]="\'http://localhost\'">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [src]="\'http://\' + value">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<img [ngSrc]="\'http://\' + value">',
          },
        ],
      },
    ],
  },
  {
    code: '<IMG [src]="value">',
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: '<IMG [ngSrc]="value">',
          },
        ],
      },
    ],
    settings: {
      hideFromDocs: true,
    },
  },
  {
    code: '<img ngSrc="http://localhost" src="http://localhost">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img ngSrc="http://localhost">',
          },
        ],
      },
    ],
  },
  {
    code: '<img ngSrc="http://src.com" src="http://src.com">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img ngSrc="http://src.com">',
          },
        ],
      },
    ],
  },
  {
    code: '<img ngSrc="http://localhost" [src]="\'http://localhost\'">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img ngSrc="http://localhost">',
          },
        ],
      },
    ],
  },
  {
    code: '<img ngSrc="http://localhost" [src]="value">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img ngSrc="http://localhost">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [ngSrc]="otherValue" src="http://localhost">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [ngSrc]="otherValue" [src]="\'http://localhost\'">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [ngSrc]="otherValue" [src]="value">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [src]="otherValue" [ngSrc]="value">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="value">',
          },
        ],
      },
    ],
  },
  {
    code: '<img src="data:image/png;base64" [ngSrc]="otherValue">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [attr.src]="\'data:image/png;base64\'" [ngSrc]="otherValue">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [src]="\'data:image/png;base64\'" [ngSrc]="otherValue">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: '<img [src]="\'data:\' + value" [ngSrc]="otherValue">',
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: '<img [ngSrc]="otherValue">',
          },
        ],
      },
    ],
  },
  {
    code: `<img
      src="http://localhost">`,
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: `<img
      ngSrc="http://localhost">`,
          },
        ],
      },
    ],
  },
  {
    code: `<img
      [src]="value"
      alt="test">`,
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: `<img
      [ngSrc]="value"
      alt="test">`,
          },
        ],
      },
    ],
  },
  {
    code: `<img
      [attr.src]="value"
      width="100">`,
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: `<img
      [ngSrc]="value"
      width="100">`,
          },
        ],
      },
    ],
  },
  {
    code: `<img
      ngSrc="http://localhost"
      src="http://localhost">`,
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: `<img
      ngSrc="http://localhost">`,
          },
        ],
      },
    ],
  },
  {
    code: `<img
      [ngSrc]="otherValue"
      [src]="value"
      alt="test">`,
    errors: [
      {
        messageId: invalidDoubleSource,
        suggestions: [
          {
            messageId: suggestRemoveSrc,
            output: `<img
      [ngSrc]="otherValue"
      alt="test">`,
          },
        ],
      },
    ],
  },
  {
    code: `<img alt="test"
      [src]="value"
    >`,
    errors: [
      {
        messageId: missingAttribute,
        suggestions: [
          {
            messageId: suggestReplaceWithNgSrc,
            output: `<img alt="test"
      [ngSrc]="value"
    >`,
          },
        ],
      },
    ],
  },
];
