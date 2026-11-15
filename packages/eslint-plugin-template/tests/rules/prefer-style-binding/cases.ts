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
const suggestMessageId: MessageIds = 'suggestStyleUnitBinding';
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
  `<div [style.width]="'30px'"></div>`,
  '<div [style.width]="`${width}px`"></div>',
  {
    code: '<section [style.height.px]="sectionHeightInPixels()"></section>',
    options: bindUnits,
  },
  {
    code: `<div [style.width]="'auto'"></div>`,
    options: bindUnits,
  },
  {
    code: `<div [style.width]="'30foo'"></div>`,
    options: bindUnits,
  },
  {
    code: `<div [style.margin]="'0 10px'"></div>`,
    options: bindUnits,
  },
  {
    code: '<div [style.padding]="`${top}px ${left}px`"></div>',
    options: bindUnits,
  },
  {
    code: '<div [style.width]="`calc(${width}px)`"></div>',
    options: bindUnits,
  },
  {
    code: '<div [style.width]="width + \'px\'"></div>',
    options: bindUnits,
  },
  {
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
  {
    code: `<div *ngIf="visible" [style.width.px]="width"></div>`,
    options: bindUnits,
  },
  {
    code: `<div style.width="30px"></div>`,
    options: bindUnits,
  },
  {
    code: `<div style.padding="{{top}}px {{left}}px"></div>`,
    options: bindUnits,
  },
  {
    code: `<div style.width="calc({{width}}px)"></div>`,
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
      'should only suggest the unit binding when a template literal interpolates a dynamic expression before the unit, as null or undefined would then remove the style',
    annotatedSource: `
        <div [style.height]="\`\${height()}em\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'height', unit: 'em' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'height', unit: 'em' },
        output: `
        <div [style.height.em]="height()"></div>
             
      `,
      },
    ],
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
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'width', unit: 'px' },
        output: `
        <div [style.width.px]="sizes['md']"></div>
             
      `,
      },
    ],
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
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail on an element carrying a structural directive, and report only once',
    annotatedSource: `
        <div *ngIf="visible" [style.width]="'30px'"></div>
                             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div *ngIf="visible" [style.width.px]="30"></div>
                             ~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report [ngStyle] only once on an element carrying a structural directive',
    annotatedSource: `
        <div *ngIf="visible" [ngStyle]="styles"></div>
                             ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report [ngStyle] only once on an element carrying an *ngFor structural directive',
    annotatedSource: `
        <li *ngFor="let item of items" [ngStyle]="item.styles"></li>
                                       ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report a unit-embedding style binding only once on an element carrying an *ngFor structural directive',
    annotatedSource: `
        <li *ngFor="let item of items" [style.width]="'30px'"></li>
                                       ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <li *ngFor="let item of items" [style.width.px]="30"></li>
                                       ~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should use the authored property name for CSS custom properties',
    annotatedSource: `
        <div [style.--gap]="'8px'"></div>
             ~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: '--gap', unit: 'px' },
    annotatedOutput: `
        <div [style.--gap.px]="8"></div>
             ~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should unwrap a parenthesized value',
    annotatedSource: `
        <div [style.width]="('30px')"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="30"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report without fixing when the value contains an HTML entity, because expression spans index the decoded value',
    annotatedSource: `
        <div [style.width]="\`\${sizes[&quot;md&quot;]}px\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fix a static value surrounded by whitespace without keeping it',
    annotatedSource: `
        <div [style.width]="  '30px'  "></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="30"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should suggest fixing a template literal surrounded by whitespace without keeping it',
    annotatedSource: `
        <div [style.width]="  \`\${width}px\`  "></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'width', unit: 'px' },
        output: `
        <div [style.width.px]="width"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding when an interpolation is followed by the unit, keeping the interpolation',
    annotatedSource: `
        <div style.width="{{width}}px"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'width', unit: 'px' },
        output: `
        <div style.width.px="{{width}}"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should preserve the spacing inside an interpolation when suggesting a fix',
    annotatedSource: `
        <div style.height="{{ height() }}em"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'height', unit: 'em' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'height', unit: 'em' },
        output: `
        <div style.height.em="{{ height() }}"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should match a unit case-insensitively and bind it in lower case',
    annotatedSource: `
        <div [style.width]="'30PX'"></div>
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
      'should match a unit case-insensitively in a template literal too',
    annotatedSource: `
        <div [style.width]="\`\${width}PX\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'width', unit: 'px' },
        output: `
        <div [style.width.px]="width"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should match a number with no integer part',
    annotatedSource: `
        <div [style.width]="'.5em'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'em' },
    annotatedOutput: `
        <div [style.width.em]=".5"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should match a number with an explicit plus sign',
    annotatedSource: `
        <div [style.width]="'+30px'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="+30"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding for a dynamic CSS custom property value, so a var() fallback is not silently enabled when the value is null or undefined',
    annotatedSource: `
        <div [style.--task-gap]="\`\${gap()}px\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: '--task-gap', unit: 'px' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: '--task-gap', unit: 'px' },
        output: `
        <div [style.--task-gap.px]="gap()"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should autofix a template literal whose interpolated value is a number literal',
    annotatedSource: `
        <div [style.width]="\`\${16}px\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="16"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should autofix a template literal whose interpolated value is a string literal',
    annotatedSource: `
        <div [style.width]="\`\${'16'}px\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div [style.width.px]="'16'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should autofix an interpolation whose value is a number literal',
    annotatedSource: `
        <div style.width="{{16}}px"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    annotatedOutput: `
        <div style.width.px="{{16}}"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding when a template literal interpolates a null literal',
    annotatedSource: `
        <div [style.width]="\`\${null}px\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'px' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'width', unit: 'px' },
        output: `
        <div [style.width.px]="null"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the rem unit',
    annotatedSource: `
        <div [style.font-size]="'1.5rem'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'font-size', unit: 'rem' },
    annotatedOutput: `
        <div [style.font-size.rem]="1.5"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the vh unit',
    annotatedSource: `
        <div [style.height]="'100vh'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'height', unit: 'vh' },
    annotatedOutput: `
        <div [style.height.vh]="100"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the vw unit',
    annotatedSource: `
        <div [style.width]="'50vw'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'width', unit: 'vw' },
    annotatedOutput: `
        <div [style.width.vw]="50"></div>
             ~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the dvh unit',
    annotatedSource: `
        <div [style.height]="'100dvh'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'height', unit: 'dvh' },
    annotatedOutput: `
        <div [style.height.dvh]="100"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the ms unit',
    annotatedSource: `
        <div [style.transition-duration]="'200ms'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'transition-duration', unit: 'ms' },
    annotatedOutput: `
        <div [style.transition-duration.ms]="200"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the s unit',
    annotatedSource: `
        <div [style.animation-duration]="'2s'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'animation-duration', unit: 's' },
    annotatedOutput: `
        <div [style.animation-duration.s]="2"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the deg unit',
    annotatedSource: `
        <div [style.rotate]="'45deg'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'rotate', unit: 'deg' },
    annotatedOutput: `
        <div [style.rotate.deg]="45"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should autofix a static value with the fr unit',
    annotatedSource: `
        <div [style.grid-auto-rows]="'1fr'"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'grid-auto-rows', unit: 'fr' },
    annotatedOutput: `
        <div [style.grid-auto-rows.fr]="1"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding for a dynamic value with the rem unit',
    annotatedSource: `
        <div [style.font-size]="\`\${size()}rem\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'font-size', unit: 'rem' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'font-size', unit: 'rem' },
        output: `
        <div [style.font-size.rem]="size()"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding for a dynamic value with the vh unit',
    annotatedSource: `
        <div [style.min-height]="\`\${height()}vh\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'min-height', unit: 'vh' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'min-height', unit: 'vh' },
        output: `
        <div [style.min-height.vh]="height()"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding for a dynamic value with the ms unit',
    annotatedSource: `
        <div [style.transition-duration]="\`\${duration()}ms\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'transition-duration', unit: 'ms' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'transition-duration', unit: 'ms' },
        output: `
        <div [style.transition-duration.ms]="duration()"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding for a dynamic value with the s unit',
    annotatedSource: `
        <div [style.animation-delay]="\`\${delay}s\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'animation-delay', unit: 's' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'animation-delay', unit: 's' },
        output: `
        <div [style.animation-delay.s]="delay"></div>
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should only suggest the unit binding for a dynamic value with the deg unit',
    annotatedSource: `
        <div [style.rotate]="\`\${angle()}deg\`"></div>
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId: unitMessageId,
    options: bindUnits,
    data: { property: 'rotate', unit: 'deg' },
    suggestions: [
      {
        messageId: suggestMessageId,
        data: { property: 'rotate', unit: 'deg' },
        output: `
        <div [style.rotate.deg]="angle()"></div>
             
      `,
      },
    ],
  }),
];
