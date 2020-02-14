import rule, {
  messageId,
  RULE_NAME,
} from '../../src/rules/component-max-inline-declarations';
import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '../test-helper';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should succeed if the number of lines does not exceeds the default lines limit (template)
    `
    @Component({
      template: '<div>just one line template</div>'
    })
    class Test {}
    `,
    {
      // should succeed if a negative limit is used and the number of lines does not exceeds the default lines limit (template)
      code: `
      @Component({
        template: '<div>first line</div>'
      })
      class Test {}
      `,
      options: [
        {
          template: -5,
        },
      ],
    },
    // should succeed if the number of lines does not exceeds the default lines limit (styles)
    `
    @Component({
      styles: ['div { display: none; }']
    })
    class Test {}
    `,
    {
      // should succeed if a negative limit is used and the number of lines does not exceeds the default lines limit (styles)
      code: `
      @Component({
        styles: ['div { display: none; }']
      })
      class Test {}
      `,
      options: [
        {
          styles: -5,
        },
      ],
    },
    // should succeed if the number of lines does not exceeds the default lines limit (animations)
    `
    @Component({
      animations: [\`state('void', style({opacity: 0, transform: 'scale(1, 0)'}))\`]
    })
    class Test {}
    `,
    {
      // should succeed if a negative limit is used and the number of lines does not exceeds the default lines limit (animations)
      code: `
      @Component({
        animations: [\`state('void', style({opacity: 0, transform: 'scale(1, 0)'}))\`]
      })
      class Test {}
      `,
      options: [
        {
          animations: -5,
        },
      ],
    },
    // should succeed when none of the template, styles and animations properties are present
    `
    @Component({
      styleUrls: ['./foobar.scss'],
      templateUrl: './foobar.html',
    })
    class Test {}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the number of lines exceeds the default lines limit (template)',
      annotatedSource: `
      @Component({
        template: \`
                  ~
          <div>first line</div>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          <div>second line</div>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          <div>third line</div>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          <div>fourth line</div>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        \`
~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
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
      options: [
        {
          template: 0,
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the number of lines exceeds the default lines limit (styles)',
      annotatedSource: `
      @Component({
        styles: [
                ~
          \`
~~~~~~~~~~~
            div {
~~~~~~~~~~~~~~~~~
              display: block;
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              height: 40px;
~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
~~~~~~~~~~~~~
          \`
~~~~~~~~~~~
        ]
~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the sum of lines (from separate inline styles) exceeds the default lines limit (styles)',
      annotatedSource: `
      @Component({
        styles: [
                ~
          \`
~~~~~~~~~~~
            div {
~~~~~~~~~~~~~~~~~
              display: block;
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
~~~~~~~~~~~~~
          \`,
~~~~~~~~~~~~
          \`
~~~~~~~~~~~
            span {
~~~~~~~~~~~~~~~~~~
              width: 30px;
~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
~~~~~~~~~~~~~
          \`
~~~~~~~~~~~
        ]
~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the number of lines exceeds a custom lines limit (styles)',
      annotatedSource: `
      @Component({
        styles: ['div { display: none; }']
                ~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
      options: [
        {
          styles: 0,
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the number of lines exceeds the default lines limit (animations)',
      annotatedSource: `
      @Component({
        animations: [
                    ~
          \`
~~~~~~~~~~~
            transformPanel: trigger('transformPanel',
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              [
~~~~~~~~~~~~~~~
                state('void', style({opacity: 0, transform: 'scale(1, 0)'})),
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                state('enter', style({opacity: 1, transform: 'scale(1, 1)'})),
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                transition('void => enter', group([
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                  query('@fadeInCalendar', animateChild()),
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                  animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                ])),
~~~~~~~~~~~~~~~~~~~~
                transition('* => void', animate('100ms linear', style({opacity: 0})))
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              ]
~~~~~~~~~~~~~~~
            ),
~~~~~~~~~~~~~~
            fadeInCalendar: trigger('fadeInCalendar', [
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              state('void', style({opacity: 0})),
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              state('enter', style({opacity: 1})),
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              transition('void => *', animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)'))
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            ]
~~~~~~~~~~~~~
          \`
~~~~~~~~~~~
        ]
~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the sum of lines exceeds the default lines limit (animations)',
      annotatedSource: `
      @Component({
        animations: [
                    ~
          \`
~~~~~~~~~~~
            transformPanel: trigger('transformPanel',
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              [
~~~~~~~~~~~~~~~
                state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              ]
~~~~~~~~~~~~~~~
            )
~~~~~~~~~~~~~
          \`,
~~~~~~~~~~~~
          \`
~~~~~~~~~~~
            transformPanel: trigger('transformPanel',
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              [
~~~~~~~~~~~~~~~
                state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              ]
~~~~~~~~~~~~~~~
            )
~~~~~~~~~~~~~
          \`
~~~~~~~~~~~
        ]
~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if the number of lines exceeds a custom lines limit (animations)',
      annotatedSource: `
      @Component({
        animations: [
                    ~
          \`
~~~~~~~~~~~
            transformPanel: trigger('transformPanel',
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              [
~~~~~~~~~~~~~~~
                state('void', style({opacity: 0, transform: 'scale(1, 0)'}))
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              ]
~~~~~~~~~~~~~~~
            )
~~~~~~~~~~~~~
          \`
~~~~~~~~~~~
        ]
~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
      options: [
        {
          animations: 2,
        },
      ],
    }),
  ],
});
