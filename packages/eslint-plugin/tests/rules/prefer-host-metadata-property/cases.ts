import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/prefer-host-metadata-property';

const messageIdPreferHostMetadataPropertyForBinding: MessageIds =
  'preferHostMetadataPropertyForBinding';
const messageIdPreferHostMetadataPropertyForListener: MessageIds =
  'preferHostMetadataPropertyForListener';

export const valid = [
  `
    @Component({
      host: {
        class: 'my-class',
      },
    })
    class Test {}
  `,
  `
    @Component({
      host: {
        '(click)': 'bar()'
      },
    })
    class Test {
      bar() {}
    }
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a @HostBinding is used',
    annotatedSource: `
      class Test {
        @HostBinding('class')
        ~~~~~~~~~~~~~~~~~~~~~
        readonly cssClass = 'my-class';
      }
      `,
    messageId: messageIdPreferHostMetadataPropertyForBinding,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a @HostListener is used',
    annotatedSource: `
      class Test {
        @HostListener('click')
        ~~~~~~~~~~~~~~~~~~~~~~
        bar() {}
      }
      `,
    messageId: messageIdPreferHostMetadataPropertyForListener,
  }),
];
