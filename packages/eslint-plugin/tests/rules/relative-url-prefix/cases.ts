import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/relative-url-prefix';

const messageId: MessageIds = 'relativeUrlPrefix';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
];
