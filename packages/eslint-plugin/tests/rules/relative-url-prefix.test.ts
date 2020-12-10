import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/relative-url-prefix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'relativeUrlPrefix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      styleUrls: ['./foobar.css']
    })
    class Test {}
`,
    `
    @Component({
      styleUrls: ['../foobar.css']
    })
    class Test {}
`,
    `
    @Component({
      styleUrls: ['./foo.css', './bar.css', './whatyouwant.css']
    })
    class Test {}
`,
    `
    @Component({
      templateUrl: './foobar.html'
    })
    class Test {}
`,
    `
    @Component({
      templateUrl: '../foobar.html'
    })
    class Test {}
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a relative URL isn't prefixed with ./`,
      annotatedSource: `
        @Component({
          styleUrls: ['foobar.css']
                      ~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a relative URL isn't prefixed with ./`,
      annotatedSource: `
        @Component({
          styleUrls: ['./../foobar.css']
                      ~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when one relative URL isn't prefixed with ./`,
      annotatedSource: `
        @Component({
          styleUrls: ['./foo.css', 'bar.css', './whatyouwant.css']
                                   ~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a relative URL isn't prefixed with ./`,
      annotatedSource: `
        @Component({
          templateUrl: 'foobar.html'
                       ~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail when a relative URL isn't prefixed with ./`,
      annotatedSource: `
        @Component({
          templateUrl: '.././foobar.html'
                       ~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
  ],
});
