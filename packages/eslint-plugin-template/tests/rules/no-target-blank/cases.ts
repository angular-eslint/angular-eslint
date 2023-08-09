import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-target-blank';

const messageId: MessageIds = 'noTargetBlank';

export const valid = [
  '<a href="https://example.com" target="_blank" rel="noreferrer">',
  '<a href="https://example.com" [attr.target]="_blank" rel="noreferrer">',
  '<a href="https://example.com" target="_blank" [attr.rel]="noreferrer">',
  '<a href="https://example.com" [attr.target]="_blank" [attr.rel]="noreferrer">',
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail element when with target="_blank" without rel="noreferrer" attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <a target="_blank">link</a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail element when with target="_blank" with grammatic error rel="norefferer" attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <a target="_blank" rel="norefferer">link</a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail element when with [attr.target]="_blank" without rel=noreferrer attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <a [attr.target]="_blank" rel="noopener">link</a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail element when with target="_blank" with [attr.rel]="noopener" attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <a target="_blank" [attr.rel]="noopener">link</a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail element when with [attr.target]="_blank" with [attr.rel]="noreopener" attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <a [attr.target]="_blank" [attr.rel]="noopener">link</a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'a' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail element when with grammatic target="blank" with proper rel="noreferrer" attribute exist',
    annotatedSource: `
        <ng-template>
          <div>
            <a target="blank" rel="noreferrer">link</a>
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          </div>
        </ng-template>
      `,
    data: { element: 'a' },
  }),
];
