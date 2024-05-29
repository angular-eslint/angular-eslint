import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/consistent-component-styles';

const messageIdUseStylesArray: MessageIds = 'useStylesArray';
const messageIdUseStyleUrls: MessageIds = 'useStyleUrls';
const messageIdUseStylesString: MessageIds = 'useStylesString';
const messageIdUseStyleUrl: MessageIds = 'useStyleUrl';

export const valid = [
  // Default.
  `
    @Component({
      styles: ':host { display: block; }',
    })
    class Test {}
  `,
  `
    @Component({
      styles: \`
        :host { display: block; }
      \`,
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'my-test',
      standalone: true,
      imports: [CommonModule],
      styles: \`
        :host { display: block; }
      \`,
      providers: [FooService]
    })
    class Test {}
  `,
  `
    @Component({
      styles: [
        ':host { display: block; }',
        \`.foo { color: red; }\`
      ],
    })
    class Test {}
  `,
  `
    @Component({
      styleUrl: \`./test.component.css\`,
    })
    class Test {}
  `,
  `
    @Component({
      styleUrls: [
        '../shared.css',
        \`./test.component.css\`
      ],
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'my-test',
      standalone: true,
      imports: [CommonModule],
      styleUrls: [
        '../shared.css',
        \`./test.component.css\`
      ],
      providers: [FooService]
    })
    class Test {}
  `,
  // String.
  {
    code: `
      @Component({
        styles: ':host { display: block; }',
      })
      class Test {}
    `,
    options: ['string'],
  },
  {
    code: `
      @Component({
        styles: \`
          :host { display: block; }
        \`,
      })
      class Test {}
    `,
    options: ['string'],
  },
  {
    code: `
      @Component({
        selector: 'my-test',
        standalone: true,
        imports: [CommonModule],
        styles: \`
          :host { display: block; }
        \`,
        providers: [FooService]
      })
      class Test {}
    `,
    options: ['string'],
  },
  {
    code: `
      @Component({
        styles: [
          ':host { display: block; }',
          \`.foo { color: red; }\`
        ],
      })
      class Test {}
    `,
    options: ['string'],
  },
  {
    code: `
      @Component({
        styleUrl: \`./test.component.css\`,
      })
      class Test {}
    `,
    options: ['string'],
  },
  {
    code: `
      @Component({
        styleUrls: [
          '../shared.css',
          \`./test.component.css\`
        ],
      })
      class Test {}
    `,
    options: ['string'],
  },
  {
    code: `
      @Component({
        selector: 'my-test',
        standalone: true,
        imports: [CommonModule],
        styleUrls: [
          '../shared.css',
          \`./test.component.css\`
        ],
        providers: [FooService]
      })
      class Test {}
    `,
    options: ['string'],
  },
  // Array.
  {
    code: `
      @Component({
        styles: [':host { display: block; }'],
      })
      class Test {}
    `,
    options: ['array'],
  },
  {
    code: `
      @Component({
        styles: [
          \`
            :host { display: block; }
          \`
        ],
      })
      class Test {}
    `,
    options: ['array'],
  },
  {
    code: `
      @Component({
        selector: 'my-test',
        standalone: true,
        imports: [CommonModule],
        styles: [
          \`
            :host { display: block; }
          \`
        ],
        providers: [FooService]
      })
      class Test {}
    `,
    options: ['array'],
  },
  {
    code: `
      @Component({
        styles: [
          ':host { display: block; }',
          \`.foo { color: red; }\`
        ],
      })
      class Test {}
    `,
    options: ['array'],
  },
  {
    code: `
      @Component({
        styleUrls: [\`./test.component.css\`],
      })
      class Test {}
    `,
    options: ['array'],
  },
  {
    code: `
      @Component({
        styleUrls: [
          '../shared.css',
          \`./test.component.css\`
        ],
      })
      class Test {}
    `,
    options: ['array'],
  },
  {
    code: `
      @Component({
        selector: 'my-test',
        standalone: true,
        imports: [CommonModule],
        styleUrls: [
          '../shared.css',
          \`./test.component.css\`
        ],
        providers: [FooService]
      })
      class Test {}
    `,
    options: ['array'],
  },
];

export const invalid = [
  // Default
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single style array value`,
    annotatedSource: `
    @Component({
      styles: [':host { display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      styles: ':host { display: block; }'
              
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single styles array value with multiple decorator properties`,
    annotatedSource: `
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styles: [':host { display: block; }'],
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      providers: []
    })
    class Test {}
  `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styles: ':host { display: block; }',
              
      providers: []
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single styleUrls array value`,
    annotatedSource: `
    @Component({
      styleUrls: ['./test.component.css']
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    messageId: messageIdUseStyleUrl,
    annotatedOutput: `
    @Component({
      styleUrl: './test.component.css'
      
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single styleUrls array value with multiple decorator properties`,
    annotatedSource: `
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styleUrls: ['./test.component.css'],
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      providers: []
    })
    class Test {}
  `,
    messageId: messageIdUseStyleUrl,
    annotatedOutput: `
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styleUrl: './test.component.css',
      
      providers: []
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep template strings when fixing styles array to string`,
    annotatedSource: `
    const type = 'block';
    @Component({
      styles: [\`:host\\t{ display: \${type}; }\`]
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    const type = 'block';
    @Component({
      styles: \`:host\\t{ display: \${type}; }\`
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep escaped characters when fixing styles array to string`,
    annotatedSource: `
    @Component({
      styles: [':host\\t{ display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      styles: ':host\\t{ display: block; }'
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep single quotes when fixing styles array to string`,
    annotatedSource: `
    @Component({
      styles: [':host{ display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      styles: ':host{ display: block; }'
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep double quotes when fixing styles array to string`,
    annotatedSource: `
    @Component({
      styles: [":host{ display: block; }"]
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      styles: ":host{ display: block; }"
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep backtick quotes when fixing styles array to string`,
    annotatedSource: `
    @Component({
      styles: [\`:host{ display: block; }\`]
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      styles: \`:host{ display: block; }\`
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep backtick quotes when fixing styleUrls array to styleUrl string`,
    annotatedSource: `
    @Component({
      styleUrls: [\`./test.component.css\`]
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: messageIdUseStyleUrl,
    annotatedOutput: `
    @Component({
      styleUrl: \`./test.component.css\`
      
    })
    class Test {}
    `,
  }),
  // String
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single style array value when string is preferred`,
    annotatedSource: `
    @Component({
      styles: [':host { display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    options: ['string'],
    messageId: messageIdUseStylesString,
    annotatedOutput: `
    @Component({
      styles: ':host { display: block; }'
              
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single styleUrls array value when string is preferred`,
    annotatedSource: `
    @Component({
      styleUrls: ['./test.component.css']
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    options: ['string'],
    messageId: messageIdUseStyleUrl,
    annotatedOutput: `
    @Component({
      styleUrl: './test.component.css'
      
    })
    class Test {}
  `,
  }),
  // Array
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a styles string when an array is preferred`,
    annotatedSource: `
    @Component({
      styles: ':host { display: block; }'
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    @Component({
      styles: [':host { display: block; }']
              
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a styles string with multiple decorator properties when an array is preferred`,
    annotatedSource: `
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styles: ':host { display: block; }',
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      providers: []
    })
    class Test {}
  `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styles: [':host { display: block; }'],
              
      providers: []
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a styleUrl string value when an array is preferred`,
    annotatedSource: `
    @Component({
      styleUrl: './test.component.css',
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    options: ['array'],
    messageId: messageIdUseStyleUrls,
    annotatedOutput: `
    @Component({
      styleUrls: ['./test.component.css'],
      
    })
    class Test {}
  `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep template strings when fixing styles string to array`,
    annotatedSource: `
    const type = 'block';
    @Component({
      styles: \`:host\\t{ display: \${type}; }\`
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    const type = 'block';
    @Component({
      styles: [\`:host\\t{ display: \${type}; }\`]
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep escaped characters when fixing styles string to array`,
    annotatedSource: `
    @Component({
      styles: ':host\\t{ display: block; }'
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    @Component({
      styles: [':host\\t{ display: block; }']
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep single quotes when fixing styles string to array`,
    annotatedSource: `
    @Component({
      styles: ':host{ display: block; }'
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    @Component({
      styles: [':host{ display: block; }']
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep double quotes when fixing styles string to array`,
    annotatedSource: `
    @Component({
      styles: ":host{ display: block; }"
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    @Component({
      styles: [":host{ display: block; }"]
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep backtick quotes when fixing styles string to array`,
    annotatedSource: `
    @Component({
      styles: \`:host{ display: block; }\`
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    options: ['array'],
    messageId: messageIdUseStylesArray,
    annotatedOutput: `
    @Component({
      styles: [\`:host{ display: block; }\`]
              
    })
    class Test {}
    `,
  }),
];
