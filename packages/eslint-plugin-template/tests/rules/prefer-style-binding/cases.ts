import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-style-binding';

const messageId: MessageIds = 'preferStyleBinding';
const unitMessageId: MessageIds = 'preferStyleUnitBinding';
const bindUnits: Options = [{ bindUnits: true }];

export const valid: readonly (string | ValidTestCase<Options>)[] = [
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
  // Unit bindings are only checked when `bindUnits` is enabled
  `<div [style.width]="'30px'"></div>`,
  '<div [style.width]="`${width}px`"></div>',
  {
    code: '<section [style.height.px]="sectionHeightInPixels()"></section>',
    options: bindUnits,
  },
  {
    // Not a numeric value, so no unit can be extracted
    code: `<div [style.width]="'auto'"></div>`,
    options: bindUnits,
  },
  {
    // `foo` is not a CSS unit
    code: `<div [style.width]="'30foo'"></div>`,
    options: bindUnits,
  },
  {
    // Multi-part values cannot be expressed as a single unit binding
    code: `<div [style.margin]="'0 10px'"></div>`,
    options: bindUnits,
  },
  {
    code: '<div [style.padding]="`${top}px ${left}px`"></div>',
    options: bindUnits,
  },
  {
    // Text before the interpolation cannot be dropped
    code: '<div [style.width]="`calc(${width}px)`"></div>',
    options: bindUnits,
  },
  {
    code: '<div [style.width]="width + \'px\'"></div>',
    options: bindUnits,
  },
  {
    // [style] and [class] bindings are out of scope of the unit check
    code: `<div [style]="'width: 30px'"></div>`,
    options: bindUnits,
  },
  {
    code: `<div [class.w-30px]="'30px'"></div>`,
    options: bindUnits,
  },
  {
    code: `<div [title]="'30px'"></div>`,
    options: bindUnits,
  },
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
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when bindUnits is enabled and a static value embeds its unit',
    annotatedSource: `
        <div [style.width]="'30px'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="30"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when bindUnits is enabled and a dashed property embeds a percentage',
    annotatedSource: `
        <div [style.margin-top]="'-12.5%'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'margin-top', unit: '%' },
    annotatedOutput: `
        <div [style.margin-top.%]="-12.5"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when bindUnits is enabled and a template literal interpolates a single expression before the unit',
    annotatedSource: `
        <div [style.height]="\`\${height()}em\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'height', unit: 'em' },
    annotatedOutput: `
        <div [style.height.em]="height()"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when bindUnits is enabled and the bind-style canonical form is used',
    annotatedSource: `
        <div bind-style.width="'30px'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div bind-style.width.px="30"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should keep the attribute quote when the interpolated expression contains the other quote',
    annotatedSource: `
        <div [style.width]="\`\${sizes['md']}px\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="sizes['md']"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for both [ngStyle] and a unit-embedding style binding on the same element',
    annotatedSource: `
        <div [ngStyle]="styles" [style.width]="'30px'"></div>
             ~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^
      `,
    options: bindUnits,
    messages: [
      { char: '~', messageId },
      {
        char: '^',
        messageId: unitMessageId,
        data: { property: 'width', unit: 'px' },
      },
    ],
    annotatedOutput: `
        <div [ngStyle]="styles" [style.width.px]="30"></div>
                                
      `,
  }),
];
