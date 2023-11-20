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
    description: 'should fail when a component has a single style array value',
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
    description:
      'should fail when a component has a single styles array value with multiple decorator properties',
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
    description:
      'should fail when a component has a single styleUrls array value',
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
    description:
      'should fail when a component has a single styleUrls array value with multiple decorator properties',
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
    description:
      'should fail when a component has a single style template string array value',
    annotatedSource: `
      @Component({
        styles: [\`:host { display: block; }\`]
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId: stylesMessageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has a single styleUrls template string array value',
    annotatedSource: `
      @Component({
        styleUrls: [\`./test.component.css\`]
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId: urlMessageId,
  }),
];
