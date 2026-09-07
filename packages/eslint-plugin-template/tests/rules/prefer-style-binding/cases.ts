import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import type { MessageIds } from '../../../src/rules/prefer-style-binding';

type Options = [];
const messageId: MessageIds = 'preferStyleBinding';

export const valid: readonly string[] = [
  '<div [style.color]="textColor"></div>',
  '<div style="color: red"></div>',
  '<div style="margin: 0" [style.color]="textColor"></div>',
  '<div [style.color]="textColor" [style.background-color]="backgroundColor"></div>',
  '<section [style.height.px]="sectionHeightInPixels()"></section>',
  `<div [style]="{ color: textColor, 'background-color': backgroundColor }"></div>`,
  `<div [style]="'display: flex; padding: 8px'"></div>`,
  '<div [style]="styles"></div>',
  '<div [style]="getStyles()"></div>',
  "<button [style.display]=\"isExpanded() ? 'block' : 'none'\">Toggle</button>",
  '<input type="text" [style.width.px]="inputWidth" [value]="inputValue">',
  // Other directives and bindings are out of scope
  '<div [ngClass]="{ active: isActive }"></div>',
  '<div [class.active]="isActive"></div>',
  '<div [myNgStyle]="styles"></div>',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is used with an object literal',
    annotatedSource: `
        <div [ngStyle]="{ color: textColor, 'background-color': backgroundColor }"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is used with a variable',
    annotatedSource: `
        <div [ngStyle]="styles"></div>
             ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is used with a method call',
    annotatedSource: `
        <div [ngStyle]="getStyles()"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is used with a ternary expression',
    annotatedSource: `
        <button [ngStyle]="isActive ? activeStyles : inactiveStyles"></button>
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is combined with a static style',
    annotatedSource: `
        <div style="margin: 0" [ngStyle]="dynamicStyles"></div>
                               ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is combined with style bindings',
    annotatedSource: `
        <div [ngStyle]="{ color: textColor }" [style.font-weight]="'bold'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is used on an input element',
    annotatedSource: `
        <input type="text" [ngStyle]="inputStyles" [value]="text">
                           ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngStyle] is used on a component',
    annotatedSource: `
        <app-card [ngStyle]="cardStyles"></app-card>
                  ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when [ngStyle] is used with unit suffix keys, which can be expressed as [style.prop.unit] bindings',
    annotatedSource: `
        <div [ngStyle]="{ 'max-width.px': width }"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when the bind-ngStyle canonical form is used',
    annotatedSource: `
        <div bind-ngStyle="styles"></div>
             ~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
];
