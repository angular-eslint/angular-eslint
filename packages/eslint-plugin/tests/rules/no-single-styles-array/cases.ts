import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-single-styles-array';

const stylesMessageId: MessageIds = 'noSingleStylesArray';
const urlMessageId: MessageIds = 'noSingleStyleUrl';

export const valid = [
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
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: `should fail when a component has a single style array value`,
    annotatedSource: `
    @Component({
      styles: [':host { display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
  `,
    messageId: stylesMessageId,
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
    messageId: stylesMessageId,
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
    messageId: urlMessageId,
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
    messageId: urlMessageId,
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
    description: `should keep template strings when fixing`,
    annotatedSource: `
    const type = 'block';
    @Component({
      styles: [\`:host\\t{ display: \${type}; }\`]
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: stylesMessageId,
    annotatedOutput: `
    const type = 'block';
    @Component({
      styles: \`:host\\t{ display: \${type}; }\`
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep escaped characters when fixing`,
    annotatedSource: `
    @Component({
      styles: [':host\\t{ display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: stylesMessageId,
    annotatedOutput: `
    @Component({
      styles: ':host\\t{ display: block; }'
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep single quotes when fixing`,
    annotatedSource: `
    @Component({
      styles: [':host{ display: block; }']
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: stylesMessageId,
    annotatedOutput: `
    @Component({
      styles: ':host{ display: block; }'
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep double quotes when fixing`,
    annotatedSource: `
    @Component({
      styles: [":host{ display: block; }"]
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: stylesMessageId,
    annotatedOutput: `
    @Component({
      styles: ":host{ display: block; }"
              
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should keep backtick quotes when fixing`,
    annotatedSource: `
    @Component({
      styles: [\`:host{ display: block; }\`]
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId: stylesMessageId,
    annotatedOutput: `
    @Component({
      styles: \`:host{ display: block; }\`
              
    })
    class Test {}
    `,
  }),
];
