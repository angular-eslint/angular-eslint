import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/relative-url-prefix';
import rule, { RULE_NAME } from '../../src/rules/relative-url-prefix';

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
      styleUrls: [
        './foo.css',
        '../bar.css',
        '../../baz.scss',
        '../../../baz.sass',
        './../test.css',
        '.././angular.sass'
      ]
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
    `
    @Component({
      templateUrl: '../../foobar.html'
    })
    class Test {}
    `,
    `
    @Component({
      templateUrl: '../../../foobar.html'
    })
    class Test {}
    `,
    `
    @Component({
      templateUrl: './../foobar.html'
    })
    class Test {}
    `,
    `
    @Component({
      templateUrl: '.././foobar.html'
    })
    class Test {}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if one of "styleUrls" is absolute',
      annotatedSource: `
        @Component({
          styleUrls: ['./foo.css', 'bar.css', '../baz.scss', '../../test.css']
                                   ~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if "templateUrl" is absolute',
      annotatedSource: `
        @Component({
          templateUrl: 'foobar.html'
                       ~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
  ],
});
