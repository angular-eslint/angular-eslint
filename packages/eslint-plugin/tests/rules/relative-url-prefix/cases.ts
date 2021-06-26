import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/relative-url-prefix';

const messageId: MessageIds = 'relativeUrlPrefix';

export const valid = [
  `class Test {}`,
  `
  @Component()
  class Test {}
  `,
  `
  @Component({})
  class Test {}
  `,
  `
  const options = {};
  @Component(options)
  class Test {}
  `,
  `
  @Component({
    template: 'app-test'
  })
  class Test {}
  `,
  `
  @Component({
    [styleUrls]: 'app-test',
  })
  class Test {}
  `,
  `
  @Component({
    templateUrl,
  })
  class Test {}
  `,
  `
  @Component({
    'styleUrls': styles
  })
  class Test {}
  `,
  `
  function templateUrl() {
    return 'test.pug';
  }

  @Component({
    templateUrl: templateUrl(),
  })
  class Test {}
  `,
  `
  @Component({
    styleUrls: [
      './foo.css',
      \`../bar.css\`,
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
    ['templateUrl']: \`./../foobar.html\`
  })
  class Test {}
  `,
  `
  @Component({
    [\`styleUrls\`]: ['.././foobar.html']
  })
  class Test {}
  `,
  `
  @Directive()
  class Test {}
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if one of `styleUrls` is absolute',
    annotatedSource: `
      @Component({
        styleUrls: ['./foo.css', 'bar.css', '../baz.scss', '../../test.css']
                                 ~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Component({
        styleUrls: ['./foo.css', './bar.css', '../baz.scss', '../../test.css']
                                 
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if one of `styleUrls` is absolute and a `Literal`',
    annotatedSource: `
      @Component({
        'styleUrls': [\`test.css\`],
                      ~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Component({
        'styleUrls': [\`./test.css\`],
                      
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `styleUrls` is absolute and a `TemplateLiteral`',
    annotatedSource: `
      @Component({
        [\`styleUrls\`]: [\`test.css\`]
                        ~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Component({
        [\`styleUrls\`]: [\`./test.css\`]
                        
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `templateUrl` is absolute',
    annotatedSource: `
      @Component({
        templateUrl: 'foobar.html'
                     ~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Component({
        templateUrl: './foobar.html'
                     
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `templateUrl` is absolute and a `Literal`',
    annotatedSource: `
      @Component({
        ['templateUrl']: \`foobar.html\`
                         ~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Component({
        ['templateUrl']: \`./foobar.html\`
                         
      })
      class Test {}
    `,
  }),
];
