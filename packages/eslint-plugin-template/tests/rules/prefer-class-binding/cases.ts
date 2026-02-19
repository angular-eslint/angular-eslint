import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import type { MessageIds } from '../../../src/rules/prefer-class-binding';

type Options = [];
const messageId: MessageIds = 'preferClassBinding';

export const valid: readonly string[] = [
  '<div [class.active]="isActive"></div>',
  '<div class="static-class"></div>',
  '<div class="static" [class.active]="isActive"></div>',
  '<div [class.active]="isActive" [class.disabled]="isDisabled"></div>',
  '<button [class.active]="isActive && !isDisabled">Click</button>',
  '<input type="text" [class.error]="hasError" [value]="inputValue">',
  // ngClass with space-separated class names in object keys (not supported by class bindings)
  `<div [ngClass]="{'btn btn-primary': isPrimary}"></div>`,
  `<div [ngClass]="{'alert alert-danger': hasError, 'alert-success': !hasError}"></div>`,
  `<button [ngClass]="{'btn btn-lg btn-block': isLarge}">Submit</button>`,
  // Mixed: some keys with spaces, some without (ngClass is needed for the space-separated ones)
  `<div [ngClass]="{'btn btn-primary': isPrimary, 'active': isActive}"></div>`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngClass] is used with a string variable',
    annotatedSource: `
        <div [ngClass]="className"></div>
             ~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngClass] is used with a method call',
    annotatedSource: `
        <div [ngClass]="getClasses()"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngClass] is used with a ternary expression',
    annotatedSource: `
        <button [ngClass]="isActive ? 'active' : 'inactive'"></button>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngClass] is combined with static class',
    annotatedSource: `
        <div class="static" [ngClass]="dynamicClass"></div>
                            ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngClass] is used on input element',
    annotatedSource: `
        <input type="text" [ngClass]="inputClass" [value]="text">
                           ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngClass] is used with an array',
    annotatedSource: `
        <div [ngClass]="['class1', 'class2']"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when [ngClass] is used with object (single-word keys)',
    annotatedSource: `
        <div [ngClass]="{ active: true, disabled: false }"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
];
