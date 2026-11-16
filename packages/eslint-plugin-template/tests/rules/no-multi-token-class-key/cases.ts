import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import type { MessageIds } from '../../../src/rules/no-multi-token-class-key';

type Options = [];
const messageId: MessageIds = 'spaceInKey';
const tabOrNewlineMessageId: MessageIds = 'tabOrNewlineInKey';
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
  `<div bind-attr.class="{ 'a b': true }"></div>`,
  `<div [class.active]="{ 'a b': true }"></div>`,
  // Angular drops empty keys and keys with a space, and these hold no class to lose
  `<div [class]="{ '': cond }"></div>`,
  `<div [class]="{ '   ': cond }"></div>`,
  `<div [class]="{ ' \\t ': cond }"></div>`,
  // A non-breaking space is part of the class name, not a separator
  `<div [class]="{ 'a\\u00A0b': cond }"></div>`,
  // Spread entries are not keys
  `<div [class]="{ ...base, active: isActive }"></div>`,
  `<div [class]="{ ...{ active: isActive } }"></div>`,
  `<div [class]="{ active: isActive }!"></div>`,
  // HTML entities in a valid class map
  `<div [class]="{ active: isOpen() &amp;&amp; !disabled }"></div>`,
  `<div [class]="{ &quot;active&quot;: cond }"></div>`,
  // An escaped interpolation start in a template literal key is plain text
  `<div [class]="{ \`a\\\${b}\`: cond }"></div>`,
  // Repeated single-token keys are not multi-token keys
  `<div [class]="{ 'a': x, 'a': y }"></div>`,
  // A map on the left of && is never the result: it is truthy, so the right side is
  `<div [class]="(flag ? { 'unused key': true } : null) && 'active'"></div>`,
  `<div [class]="{ 'a b': true } && classes()"></div>`,
  `<div [class]="{ ...({ 'a b': x } && extra) }"></div>`,
  // Valid keys spread from a ternary or &&
  `<div [class]="{ ...(flag ? { a: x } : {}), b: y, ...(wide && { c: z }) }"></div>`,
  // A pipe in the condition of a valid key
  `<div [class]="{ active: active$ | async }"></div>`,
  // An ampersand that starts no character reference is part of the class name
  `<div [class]="{ '[&>*]:p-2': cond }"></div>`,
  // Angular applies no classes on nodes that render no element
  `<ng-template [class]="{ 'a b': cond }"></ng-template>`,
  `<ng-container [class]="{ 'a b': cond }"></ng-container>`,
  `<ng-container *ngIf="show" [class]="{ 'a b': cond }"></ng-container>`,
  `<ng-template [ngIf]="show" [class]="{ 'a\tb': cond }"><div></div></ng-template>`,
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
    description: 'should fail on the right side of &&',
    annotatedSource: `
        <div [class]="isOpen() && { 'a b': x }"></div>
                                    ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="isOpen() && { 'a': x, 'b': x }"></div>
                                    
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in a bind-class binding',
    annotatedSource: `
        <div bind-class="{ 'a b': x }"></div>
                           ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div bind-class="{ 'a': x, 'b': x }"></div>
                           
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with the runtime error message when a key holds a tab but no space',
    annotatedSource: `
        <div [class]="{ 'a	b': x }"></div>
                        ~~~~~
      `,
    messageId: tabOrNewlineMessageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': x, 'b': x }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail without a suggestion when a key holds an escaped newline but no space',
    annotatedSource: `
        <div [class]="{ 'a\\nb': x }"></div>
                        ~~~~~~
      `,
    messageId: tabOrNewlineMessageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail without a suggestion when a key holds only tabs',
    annotatedSource: `
        <div [class]="{ '\\t': x }"></div>
                        ~~~~
      `,
    messageId: tabOrNewlineMessageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail with the dropped key message when a key holds both a space and a tab',
    annotatedSource: `
        <div [class]="{ 'a	b c': x }"></div>
                        ~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': x, 'b': x, 'c': x }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should not suggest a split when the key holds escaped quotes',
    annotatedSource: `
        <div [class]="{ 'content-[\\'x\\'] block': x }"></div>
                        ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report the whole value without a suggestion when an HTML entity shifts the condition',
    annotatedSource: `
        <div [class]="{ 'a b': isOpen() &amp;&amp; !disabled }"></div>
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report the whole value without a suggestion when the key is quoted with an HTML entity',
    annotatedSource: `
        <div [class]="{ &quot;a b&quot;: cond }"></div>
                      ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report the whole value without a suggestion when an HTML entity precedes the key',
    annotatedSource: `
        <div [class]="{ 'x': a &amp;&amp; b, 'c d': e }"></div>
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that duplicates a later key of the same map',
    annotatedSource: `
        <div [class]="{ 'text-white bold': a, 'text-white': highContrast() }"></div>
                        ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that duplicates an earlier key of the same map',
    annotatedSource: `
        <div [class]="{ 'text-white': highContrast(), 'text-white bold': a }"></div>
                                                      ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that duplicates a key of the map it is spread into',
    annotatedSource: `
        <div [class]="{ 'a': y, ...{ 'a b': x } }"></div>
                                     ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should still suggest a split when the same class is a key of the other ternary branch',
    annotatedSource: `
        <div [class]="cond ? { 'a b': x } : { 'a': y }"></div>
                               ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="cond ? { 'a': x, 'b': x } : { 'a': y }"></div>
                               
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a template literal key holds an escaped interpolation start',
    annotatedSource: `
        <div [class]="{ \`a \\\${b} c\`: x }"></div>
                        ~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on a class map with a non-null assertion',
    annotatedSource: `
        <div [class]="{ 'a b': x }!"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': x, 'b': x }!"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on a class map spread inline into the class map',
    annotatedSource: `
        <div [class]="{ active: y, ...({ 'a b': x }) }"></div>
                                         ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ active: y, ...({ 'a': x, 'b': x }) }"></div>
                                         
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on the right side of ||',
    annotatedSource: `
        <div [class]="fallback || { 'a b': x }"></div>
                                    ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="fallback || { 'a': x, 'b': x }"></div>
                                    
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes the attribute quote into the template',
    annotatedSource: `
        <div [class]="{ 'a\\u0022b c': cond }"></div>
                        ~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes the single attribute quote into the template',
    annotatedSource: `
        <div [class]='{ "a\\u0027b c": cond }'></div>
                        ~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes a quote, even one that is not the attribute quote',
    annotatedSource: `
        <div [class]='{ "a\\u0022b c": cond }'></div>
                        ~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes an HTML character reference into the template',
    annotatedSource: `
        <div [class]="{ 'a\\u0026copy; b': cond }"></div>
                        ~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes a null character into the template',
    annotatedSource: `
        <div [class]="{ 'a\\u0000b c': cond }"></div>
                        ~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes an interpolation start into the template',
    annotatedSource: `
        <div [class]="{ 'a\\u007B\\u007Bb c': cond }"></div>
                        ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when the attribute value holds an interpolation start',
    annotatedSource: `
        <div [class]="{ 'a b': x === '{{' }"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should keep an ampersand that starts no character reference when splitting the key',
    annotatedSource: `
        <div [class]="{ '[&>*]:p-2 flex': cond }"></div>
                        ~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ '[&>*]:p-2': cond, 'flex': cond }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that duplicates a key of a ternary spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag ? { a: true } : {}), 'a b': false }"></div>
                                                      ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that duplicates a key of an && operand spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag && { a: true }), 'a b': false }"></div>
                                                  ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a spread into the map holds unknown keys',
    annotatedSource: `
        <div [class]="{ ...base, 'a b': false }"></div>
                                 ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when either side of || spread into the map holds unknown keys',
    annotatedSource: `
        <div [class]="{ ...(flag || base), 'a b': false }"></div>
                                           ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a spread string adds keys to the map',
    annotatedSource: `
        <div [class]="{ ...'ab', 'a b': false }"></div>
                                 ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should still suggest a split when the spreads into the map hold no matching key',
    annotatedSource: `
        <div [class]="{ ...(flag ? { c: y } : null), ...(base && { d: z }), 'a b': x }"></div>
                                                                            ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ ...(flag ? { c: y } : null), ...(base && { d: z }), 'a': x, 'b': x }"></div>
                                                                            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on a class map in a ternary spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag ? { 'a b': x } : {}) }"></div>
                                     ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ ...(flag ? { 'a': x, 'b': x } : {}) }"></div>
                                     
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail on a class map on the right of && spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag && { 'a b': x }) }"></div>
                                      ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ ...(flag && { 'a': x, 'b': x }) }"></div>
                                      
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail on a class map with a non-null assertion in a ternary spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag ? null : { 'a b': x }!) }"></div>
                                            ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ ...(flag ? null : { 'a': x, 'b': x }!) }"></div>
                                            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should still suggest a split when the same class is a key of the other branch of a ternary spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag ? { 'a b': x } : { a: y }) }"></div>
                                     ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ ...(flag ? { 'a': x, 'b': x } : { a: y }) }"></div>
                                     
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should suggest splitting the same key in both branches of a ternary spread into the map',
    annotatedSource: `
        <div [class]="{ ...(flag ? { 'a b': x } : { 'a b': y }) }"></div>
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
        <div [class]="{ ...(flag ? { 'a': x, 'b': x } : { 'a b': y }) }"></div>
                                                    
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
        <div [class]="{ ...(flag ? { 'a b': x } : { 'a': y, 'b': y }) }"></div>
                                                    
      `,
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a ternary spread into the map repeats the key outside the ternary',
    annotatedSource: `
        <div [class]="{ ...(flag ? { 'a b': x } : {}), 'a b': y }"></div>
                                     ~~~~~             ^^^^^
      `,
    messages: [
      { char: '~', messageId, suggestions: [] },
      { char: '^', messageId, suggestions: [] },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should not suggest a split that would write a __proto__ key',
    annotatedSource: `
        <div [class]="{ '__proto__ c': cond }"></div>
                        ~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should write a repeated class once when splitting the key',
    annotatedSource: `
        <div [class]="{ 'a a': next() }"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': next() }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should write each repeated class once when splitting a longer key',
    annotatedSource: `
        <div [class]="{ 'a b c a': isActive() }"></div>
                        ~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': isActive(), 'b': isActive(), 'c': isActive() }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that runs a pipe in the condition once per class',
    annotatedSource: `
        <div [class]="{ 'a b': (state$ | async)?.active }"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should suggest a split with a pipe in the condition when the key holds one distinct class',
    annotatedSource: `
        <div [class]="{ 'a a': active$ | async }"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'a': active$ | async }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when the key holds an escape that decodes to a plain character',
    annotatedSource: `
        <div [class]="{ 'a\\u0062 c': cond }"></div>
                        ~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split that writes a named character reference with digits into the template',
    annotatedSource: `
        <div [class]="{ 'a\\u0026frac12; b': cond }"></div>
                        ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a class name holds a backtick',
    annotatedSource: `
        <div [class]="{ 'a\`b c': cond }"></div>
                        ~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a class name holds a dollar sign',
    annotatedSource: `
        <div [class]="{ 'a\${b} c': cond }"></div>
                        ~~~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a class name holds an opening angle bracket',
    annotatedSource: `
        <div [class]="{ 'a<b c': cond }"></div>
                        ~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest a split when a class name holds an ampersand followed by a letter',
    annotatedSource: `
        <div [class]="{ 'a&b c': cond }"></div>
                        ~~~~~~~
      `,
    messageId,
    suggestions: [],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should keep Tailwind-style class names when splitting the key',
    annotatedSource: `
        <div [class]="{ 'md:flex w-1/2 !mt-0 hover:bg-[#fff] [&>*]:p-2 a&-b': cond }"></div>
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ 'md:flex': cond, 'w-1/2': cond, '!mt-0': cond, 'hover:bg-[#fff]': cond, '[&>*]:p-2': cond, 'a&-b': cond }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should keep template literal quotes when splitting the key',
    annotatedSource: `
        <div [class]="{ \`a b\`: cond }"></div>
                        ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div [class]="{ \`a\`: cond, \`b\`: cond }"></div>
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not suggest splitting a key that a later entry of the map overrides',
    annotatedSource: `
        <div [class]="{ ...{ 'a b': true }, 'a b': false }"></div>
                             ~~~~~          ^^^^^
      `,
    messages: [
      { char: '~', messageId, suggestions: [] },
      { char: '^', messageId, suggestions: [] },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should not suggest splitting a key that the map repeats',
    annotatedSource: `
        <div [class]="{ 'a b': x, 'a b': y }"></div>
                        ~~~~~     ^^^^^
      `,
    messages: [
      { char: '~', messageId, suggestions: [] },
      { char: '^', messageId, suggestions: [] },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should report once on an element with a structural directive',
    annotatedSource: `
        <div *ngIf="show" [class]="{ 'a b': cond }"></div>
                                     ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <div *ngIf="show" [class]="{ 'a': cond, 'b': cond }"></div>
                                     
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail on an element inside an ng-template',
    annotatedSource: `
        <ng-template><span [class]="{ 'a b': cond }"></span></ng-template>
                                      ~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestionMessageId,
        output: `
        <ng-template><span [class]="{ 'a': cond, 'b': cond }"></span></ng-template>
                                      
      `,
      },
    ],
  }),
];
