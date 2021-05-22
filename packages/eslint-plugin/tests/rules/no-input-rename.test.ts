import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-input-rename';
import rule, { RULE_NAME } from '../../src/rules/no-input-rename';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});
const messageId: MessageIds = 'noInputRename';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should succeed when a component input property is not renamed
    `
    import { Input } from '@angular/core';
    @Component
    class TestComponent {
      @Input() label: string;
    }
    `,
    // should succeed when a component input setter is not renamed
    `
    import { Input } from '@angular/core';
    @Component
    class TestComponent {
      @Input() set label(label: string) {}
    }
    `,
    // should succeed when a directive selector is strictly equal to the alias
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: '[foo]'
    })
    class TestDirective {
      @Input('foo') bar = new EventEmitter<void>();
    }
    `,
    // should succeed when the first directive selector is strictly equal to the alias
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: '[foo], test'
    })
    class TestDirective {
      @Input('foo') bar = new EventEmitter<void>();
    }
    `,
    // should succeed when the second directive selector is strictly equal to the alias
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: '[foo], myselector'
    })
    class TestDirective {
      @Input('myselector') bar: string;
    }
    `,
    // should succeed when a directive selector is also an input property
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: '[foo], label2'
    })
    class TestDirective {
      @Input() foo: string;
    }
    `,
    // should succeed when a directive selector is also an input property with tag
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: 'foo[bar]'
    })
    class TestDirective {
      @Input() bar: string;
    }
    `,
    // should succeed when an input alias is kebab-cased and whitelisted
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: 'foo'
    })
    class TestDirective {
      @Input('aria-label') ariaLabel: string;
    }
    `,
    // should succeed when an input alias is strictly equal to the selector plus the property name
    `
    import { Input } from '@angular/core';
    @Directive({
      selector: 'foo'
    })
    class TestDirective {
      @Input('fooMyColor') myColor: string;
    }
    `,
    // should succeed when an Input decorator is not imported from '@angular/core'
    `
    import { Input } from 'baz';
    @Component({
      selector: 'foo'
    })
    class TestComponent {
      @Input('bar') label: string;
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when a component input property is renamed',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Component({
        selector: 'foo'
      })
      class TestComponent {
        @Input('bar') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when a component input setter is renamed',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Component({
        selector: 'foo'
      })
      class TestComponent {
        @Input('bar') set label(label: string) {}
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when a component input property is fake renamed',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Component({
        selector: 'foo'
      })
      class TestComponent {
        @Input('foo') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when a component input setter is fake renamed',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Component({
        selector: 'foo'
      })
      class TestComponent {
        @Input('foo') set label(label: string) {}
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when a directive input property is renamed',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Directive({
        selector: '[foo]'
      })
      class TestDirective {
        @Input('labelText') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when a directive input property is renamed and its name is strictly equal to the property',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Directive({
        selector: '[label]'
      })
      class TestDirective {
        @Input('label') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when a directive input property has the same name as the alias',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Directive({
        selector: '[foo]'
      })
      class TestDirective {
        @Input('label') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `should fail when a directive input alias is kebab-cased and whitelisted, but the property doesn't match the alias`,
      annotatedSource: `
      import { Input } from '@angular/core';
      @Directive({
        selector: 'foo'
      })
      class TestDirective {
        @Input('aria-invalid') ariaBusy: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `should fail when a directive input alias is prefixed by directive's selector, but the suffix does not match the property name`,
      annotatedSource: `
      import { Input } from '@angular/core';
      @Directive({
        selector: 'foo'
      })
      class TestDirective {
        @Input('fooColor') colors: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when a directive input alias is not strictly equal to the selector plus the property name',
      annotatedSource: `
      import { Input } from '@angular/core';
      @Directive({
        selector: 'foo'
      })
      class TestDirective {
        @Input('foocolor') color: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
  ],
});
