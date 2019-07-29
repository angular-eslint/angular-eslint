import rule, { MessageIds, RULE_NAME } from '../../src/rules/no-forward-ref';
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

const messageId: MessageIds = 'noForwardRef';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      selector: 'test',
      template: ''
    })
    export class Test {
      constructor() {
        this.test();
      }

      test() {}
    }
 `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if forwardRef is called in constructor',
      annotatedSource: `
        @Component({
          selector: 'test',
          template: ''
        })
        export class Test {
          constructor(@Inject(forwardRef(() => TestService)) testService) {}
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
        export class TestService {}
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if forwardRef is called in a metadata property',
      annotatedSource: `
        @Component({
          providers: [
            {
              multi: true,
              provide: NG_VALUE_ACCESSOR,
              useExisting: forwardRef(() => TagsValueAccessor)
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
          ],
          selector: '[tags]',
        })
        export class TagsValueAccessor {}
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if forwardRef is called in a variable declaration',
      annotatedSource: `
        const TAGS_VALUE_ACCESSOR: StaticProvider = {
          multi: true,
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => TagsValueAccessor)
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        };
        @Directive({
          providers: [TAGS_VALUE_ACCESSOR],
          selector: '[tags]'
        })
        export class TagsValueAccessor {}
`,
      messageId,
    }),
  ],
});
