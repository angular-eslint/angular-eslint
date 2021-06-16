import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/accessibility-alt-text';

const altTextArea: MessageIds = 'altTextArea';
const altTextImg: MessageIds = 'altTextImg';
const altTextImgWithPresentationRole: MessageIds =
  'altTextImgWithPresentationRole';
const altTextInput: MessageIds = 'altTextInput';
const altTextObject: MessageIds = 'altTextObject';
const altTextWithBinaryOrEmptyOrNullableAriaLabel: MessageIds =
  'altTextWithBinaryOrEmptyOrNullableAriaLabel';
const altTextWithBinaryOrNullableAlt: MessageIds =
  'altTextWithBinaryOrNullableAlt';
const suggestReplaceWithEmptyAlt: MessageIds = 'suggestReplaceWithEmptyAlt';

export const valid = [
  '<div></div>',
  `<app-top-bar [attr.aria-label]="'Aria'"></app-top-bar>`,

  // #region `<area>`
  '<area alt="">',
  '<area alt=" ">',
  '<area [alt]="">',
  '<area alt="This is descriptive!">',
  '<area aria-label="id1">',
  `<area [attr.aria-labelledby]="'foo'">`,
  // #endregion `<area>`

  // #region `<img>`
  '<img alt="">',
  '<img alt=" ">',
  '<img alt="foo">',
  '<img alt="{{null}}">',
  `<img [attr.alt]="'foo'">`,
  '<img [alt]="alt">',
  `<img [alt]="alt ?? 'Alt text'">`,
  `<img [alt]="foo.bar || ''">`,
  `<img [alt]="{{alt + 'Alt text'}}">`,
  '<img [alt]="getAlt()">',
  `<img [alt]="error ? 'not working' : 'working'">`,
  '<img alt="" role="none">',
  `<img [alt]="''" role="presentation">`,
  '<img alt="" [attr.role]="none">',
  `<img alt="" [role]="'presentation'">`,
  '<img alt="" aria-label="foo">',
  `<img alt="" [attr.aria-labelledby]="'id0'">`,
  `<img [attr.aria-label]="'foo'">`,
  '<img aria-labelledby="id1">',
  `
    <img src="images/solar_system.jpg" alt="Solar System" width="472" height="800" usemap="#map">
    <map name="map">
      <area shape="rect" coords="115,158,276,192" href="http://en.wikipedia.org/wiki/Mercury_%28planet%29" alt="Mercury">
      <area shape="rect" coords="115,193,276,234" href="http://en.wikipedia.org/wiki/Venus" alt="Venus">
    </map>
  `,
  // #endregion `<img>`

  // #region `<input type="image">`
  '<input>',
  '<input type="text">',
  '<input type="image" alt="">',
  '<input type="image" alt=" ">',
  '<input type="image" alt="This is descriptive!">',
  '<input aria-label="">',
  '<input type="image" aria-label="foo">',
  '<input type="image" [attr.aria-labelledby]="id1">',
  // #endregion `<input type="image">`

  // #region `<object>`
  '<object aria-label="foo"></object>',
  '<object [attr.aria-labelledby]="id1"></object>',
  '<object innerHtml="foo"></object>',
  '<object [innerHTML]="foo"></object>',
  '<object [innerText]="foo"></object>',
  '<object outerHTML="foo"></object>',
  '<object title="An object"></object>',
  '<object>Meaningful description</object>',
  '<object><p>Meaningful description</p></object>',
  // #endregion `<object>`
];

export const invalid = [
  // #region `<area>`
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<area>` does not have any accessibility attribute',
    annotatedSource: `
      <area>
      ~~~~~~
    `,
    messageId: altTextArea,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<area>` `alt` is empty',
    annotatedSource: `
      <area alt>
            ~~~
    `,
    messageId: altTextWithBinaryOrNullableAlt,
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <area alt="">
            
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<area>` `alt` is `null`',
    annotatedSource: `
      <area [alt]="null">
            ~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrNullableAlt,
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <area alt="">
            
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<area>` `aria-label` attribute is empty',
    annotatedSource: `
      <area aria-label>
            ~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrEmptyOrNullableAriaLabel,
    data: { ariaAttributeName: 'aria-label' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <area alt="">
            
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<area>` `aria-labelledby` attribute is empty',
    annotatedSource: `
      <area aria-labelledby="">
            ~~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrEmptyOrNullableAriaLabel,
    data: { ariaAttributeName: 'aria-labelledby' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <area alt="">
            
    `,
      },
    ],
  }),
  // #endregion `<area>`
  // #region `<img>`
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<img>` does not have any accessibility attribute',
    annotatedSource: `
      <img alt>
           ~~~
    `,
    messageId: altTextWithBinaryOrNullableAlt,
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <img alt="">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<img>` `alt` is `undefined`',
    annotatedSource: `
      <img [alt]="undefined">
           ~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrNullableAlt,
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <img alt="">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<img>` `aria-label` attribute is empty',
    annotatedSource: `
      <img aria-label="">
           ~~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrEmptyOrNullableAriaLabel,
    data: { ariaAttributeName: 'aria-label' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <img alt="">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<img>` `aria-labelledby` attribute is empty',
    annotatedSource: `
      <img [attr.aria-labelledby]="">
           ~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrEmptyOrNullableAriaLabel,
    data: { ariaAttributeName: 'aria-labelledby' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <img alt="">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<img>` `role` is set to "none"',
    annotatedSource: `
      <img role="none">
           ~~~~~~~~~~~
    `,
    messageId: altTextImgWithPresentationRole,
    data: { ariaAttributeName: 'aria-label' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <img alt="">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<img>` `role` is set to "presentation"',
    annotatedSource: `
      <img [attr.role]="'presentation'">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextImgWithPresentationRole,
    data: { ariaAttributeName: 'aria-label' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <img alt="">
           
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<img>` is inside another element and does not have any accessibility attribute',
    annotatedSource: `
      <ng-template>
        <a href="/maps/nav.map"><img src="/images/navbar.gif" ismap></a>
                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      </ng-template>
    `,
    messageId: altTextImg,
  }),
  // #endregion `<img>`
  // #region `<input type="image">`
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<input>` does not have any accessibility attribute',
    annotatedSource: `
      <input type="image">
      ~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextInput,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<input>` `alt` attribute is `null`',
    annotatedSource: `
      <input type="image" [alt]="null">
                          ~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrNullableAlt,
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <input type="image" alt="">
                          
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<input>` `aria-label` attribute is empty',
    annotatedSource: `
      <input aria-label="" [type]="'image'">
             ~~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrEmptyOrNullableAriaLabel,
    data: { ariaAttributeName: 'aria-label' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <input alt="" [type]="'image'">
             
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<input>` `aria-labelledby` attribute is `null`',
    annotatedSource: `
      <input [attr.aria-labelledby]="null" [attr.type]="'image'">
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextWithBinaryOrEmptyOrNullableAriaLabel,
    data: { ariaAttributeName: 'aria-labelledby' },
    suggestions: [
      {
        messageId: suggestReplaceWithEmptyAlt,
        output: `
      <input alt="" [attr.type]="'image'">
             
    `,
      },
    ],
  }),
  // #endregion `<input type="image">`
  // #region `<object>`
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<object>` does not have inner text, `aria-label`, `aria-labelledby` or `title` attribute',
    annotatedSource: `
      <object></object>
      ~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextObject,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<object>` does not have accessible child',
    annotatedSource: `
      <object [innerHttp]="testing"><i aria-hidden></i></object>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: altTextObject,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `<object>` `aria-label` attribute is empty',
    annotatedSource: `
      <object aria-label=""></object>
              ~~~~~~~~~~~~~
    `,
    messageId: altTextObject,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<object>` `aria-labelledby` attribute is empty',
    annotatedSource: `
      <object aria-labelledby></object>
              ~~~~~~~~~~~~~~~
    `,
    messageId: altTextObject,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `<object>` `title` attribute is `null`, `undefined` or empty',
    annotatedSource: `
      <object [title]="null"></object>
              ~~~~~~~~~~~~~~
      <object title=""></object>
              ^^^^^^^^
      <object [attr.title]="undefined"></object>
              ########################
    `,
    messages: [
      { char: '~', messageId: altTextObject },
      { char: '^', messageId: altTextObject },
      { char: '#', messageId: altTextObject },
    ],
  }),
  // #endregion `<object>`
];
