import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-duplicates-in-metadata-arrays';

const messageId: MessageIds = 'noDuplicatesInMetadataArrays';

export const valid = [
  `
  @NgModule({
    imports: [importModuleA, importModuleB, importModuleC]
  })
  class Test {}
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there is a duplicate import in a Module',
    annotatedSource: `
      @NgModule({
        imports: [importModuleA, importModuleB, importModuleA]
                                                ~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    // annotatedOutput: `
    //   @NgModule({
    //     imports: [importModuleA, importModuleB, importModuleA]
    //                                             ~~~~~~~~~~~~~
    //   })
    //   class Test {}
    // `,
  }),
];
