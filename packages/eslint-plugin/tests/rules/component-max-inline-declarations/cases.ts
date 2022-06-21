import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/component-max-inline-declarations';

const messageId: MessageIds = 'componentMaxInlineDeclarations';

export const valid = [
  // should succeed if the number of the template lines does not exceeds the default lines limit
  `
    @Component({
      template: '<div>just one line template</div>'
    })
    class Test {}
    `,
  // should succeed if the number of the styles lines does not exceeds the default lines limit
  `
    @Component({
      styles: ['div { display: none; }']
    })
    class Test {}
    `,
  // should succeed if the number of the animations lines does not exceeds the default lines limit
  `
    @Component({
      animations: [state('void', style({opacity: 0, transform: 'scale(1, 0)'}))]
    })
    class Test {}
    `,
  // should succeed if template, styles and animations properties are not present
  `
    @Component({
      styleUrls: ['./foobar.scss'],
      templateUrl: './foobar.html',
    })
    class Test {}
    `,
  `
    @Component({
      animations: [
        state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
      ],
      templateUrl: './foobar.html',
    })
    class Test {}
    `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the number of the template lines exceeds the default lines limit',
    annotatedSource: `
      @Component({
        template: \`
                  ~
          <div>first line</div>
          <div>second line</div>
          <div>third line</div>
          <div>fourth line</div>
        \`
        ~
      })
      class Test {}
      `,
    messageId,
    data: { lineCount: 4, max: 3, propertyType: 'template' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the number of lines exceeds a custom lines limit (template)',
    annotatedSource: `
      @Component({
        template: '<div>first line</div>'
                  ~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
      `,
    messageId,
    options: [{ template: 0 }],
    data: { lineCount: 1, max: 0, propertyType: 'template' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the number of the styles lines exceeds the default lines limit',
    annotatedSource: `
      @Component({
        styles: [
                ~
          \`
            div {
              display: block;
              height: 40px;
            }
          \`
        ]
        ~
      })
      class Test {}
      `,
    messageId,
    data: { lineCount: 4, max: 3, propertyType: 'styles' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the sum of lines (from separate styles) exceeds the default lines limit',
    annotatedSource: `
      @Component({
        styles: [
                ~
          \`
            div {
              display: block;
            }
          \`,
          \`
            span {
              width: 30px;
            }
          \`
        ]
        ~
      })
      class Test {}
      `,
    messageId,
    data: { lineCount: 6, max: 3, propertyType: 'styles' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the number of the styles lines exceeds a custom lines limit',
    annotatedSource: `
      @Component({
        styles: ['div { display: none; }']
                ~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
      `,
    messageId,
    options: [{ styles: 0 }],
    data: { lineCount: 1, max: 0, propertyType: 'styles' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the number of the animations lines exceeds the default lines limit',
    annotatedSource: `
      @Component({
        animations: [{
                    ~
          transformPanelWrap: trigger('transformPanelWrap', [
            transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
          ]),
          transformPanel: trigger('transformPanel', [
            state('void', style({
              transform: 'scaleY(0.8)',
              minWidth: '100%',
              opacity: 0
            })),
            state('showing', style({
              opacity: 1,
              minWidth: 'calc(100% + 32px)',
              transform: 'scaleY(1)'
            })),
            state('next', style({height: '0px', visibility: 'hidden'}))
          ])
        }]
         ~
      })
      class Test {}
      `,
    messageId,
    data: { lineCount: 16, max: 15, propertyType: 'animations' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the sum of lines (from separate animations) exceeds the default lines limit',
    annotatedSource: `
      @Component({
        animations: [
                    ~
          trigger('dialogContainer', [
            transition('* => void', query('@transformPanel', [animateChild()], {optional: true}))
          ]),
          trigger('transformPanel', [
            state('void', style({
              transform: 'scaleY(0.8)',
              minWidth: '100%',
              opacity: 0
            })),
            state('showing', style({
              opacity: 1,
              minWidth: 'calc(100% + 32px)',
              transform: 'scaleY(1)'
            }))
          ]),
          trigger('transformPanel', [
            state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
          ])
        ]
        ~
      })
      class Test {}
      `,
    messageId,
    data: { lineCount: 18, max: 15, propertyType: 'animations' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the number of the animations lines exceeds a custom lines limit',
    annotatedSource: `
      @Component({
        animations: [{
                    ~
          transformPanel: trigger('transformPanel', [
            state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
          ])
        }]
         ~
      })
      class Test {}
      `,
    messageId,
    options: [{ animations: 2 }],
    data: { lineCount: 3, max: 2, propertyType: 'animations' },
  }),
];
