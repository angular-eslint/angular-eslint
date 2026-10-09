import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import type { MessageIds } from '../../../src/rules/no-multi-token-class-key';

type Options = [];
const messageId: MessageIds = 'multiTokenKey';
const suggestionMessageId: MessageIds = 'splitKey';

export const valid: readonly string[] = [
  `<div [class]="{ 'text-x': cond, 'dark:text-y': cond }"></div>`,
  `<div [class]='{ active: isActive, "disabled": isDisabled }'></div>`,
  // A string [class] applies every token in it
  `<div [class]="compact() ? 'inline-flex gap-1' : 'mt-2 grid'"></div>`,
  `<div [class]="'btn btn-primary'"></div>`,
  // A spaced string as a value is not a key
  `<div [class]="{ ok: label === 'two words' }"></div>`,
  // A map bound by reference has no keys in the template
  `<div [class]="classMap"></div>`,
  // A map in a value position is not the class map
  `<div [class]="{ ok: flag() ? { 'a b': 1 } : null }"></div>`,
  `<div [class]="fn({ 'a b': true })"></div>`,
  // [ngClass] splits keys on whitespace
  `<div [ngClass]="{ 'btn btn-primary': isPrimary }"></div>`,
  `<div [attr.class]="{ 'a b': true }"></div>`,
  `<div [class.active]="{ 'a b': true }"></div>`,
  // Empty and whitespace-only keys hold no class to split into
  `<div [class]="{ '': cond }"></div>`,
  `<div [class]="{ '   ': cond }"></div>`,
  // Spread entries are not keys
  `<div [class]="{ ...base, active: isActive }"></div>`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a class map key holds two tokens',
    annotatedSource: `
        <div [class]="{ 'text-x dark:text-y': cond }"></div>
                        ~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'text-x': cond, 'dark:text-y': cond }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should keep double quotes and the full condition text in the suggestion',
    annotatedSource: `
        <div [class]='{ "a b c": isOpen() && !disabled }'></div>
                        ~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]='{ "a": isOpen() && !disabled, "b": isOpen() && !disabled, "c": isOpen() && !disabled }'></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on a padded key',
    annotatedSource: `
        <div [class]="{ ' a  b ': cond }"></div>
                        ~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': cond, 'b': cond }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail inside parentheses',
    annotatedSource: `
        <div [class]="({ 'a b': cond })"></div>
                         ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="({ 'a': cond, 'b': cond })"></div>
                         
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should report each multi-token key in the map',
    annotatedSource: `
        <div [class]="{ 'a b': x, ok: y, 'c d': z }"></div>
                        ~~~~~            ^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        suggestions: [
          {
            messageId: suggestionMessageId,
            output: `
        <div [class]="{ 'a': x, 'b': x, ok: y, 'c d': z }"></div>
                                         
      `,
          },
        ],
      },
      {
        char: '^',
        messageId,
        suggestions: [
          {
            messageId: suggestionMessageId,
            output: `
        <div [class]="{ 'a b': x, ok: y, 'c': z, 'd': z }"></div>
                                         
      `,
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in both branches of a ternary',
    annotatedSource: `
        <div [class]="wide() ? { 'a b': x } : { 'c d': y }"></div>
                                 ~~~~~          ^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId,
        suggestions: [
          {
            messageId: suggestionMessageId,
            output: `
        <div [class]="wide() ? { 'a': x, 'b': x } : { 'c d': y }"></div>
                                                
      `,
          },
        ],
      },
      {
        char: '^',
        messageId,
        suggestions: [
          {
            messageId: suggestionMessageId,
            output: `
        <div [class]="wide() ? { 'a b': x } : { 'c': y, 'd': y }"></div>
                                                
      `,
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on either side of ??',
    annotatedSource: `
        <div [class]="override ?? { 'a b': x }"></div>
                                    ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="override ?? { 'a': x, 'b': x }"></div>
                                    
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on either side of ||',
    annotatedSource: `
        <div [class]="{ 'a b': x } || fallback"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': x, 'b': x } || fallback"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should re-escape quotes inside the key when splitting it',
    annotatedSource: `
        <div [class]="{ 'content-[\\'x\\'] block': x }"></div>
                        ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'content-[\\'x\\']': x, 'block': x }"></div>
                        
      `,
      },
    ],
  }),
];
