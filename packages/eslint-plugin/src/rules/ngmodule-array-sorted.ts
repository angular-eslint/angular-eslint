import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { MODULE_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorPropertyValue,
  isArrayExpression,
  isIdentifier,
} from '../utils/utils';

import { Options } from '../utils/property-selector';
import { NgModule } from '@angular/compiler/src/core';

export const RULE_NAME = 'ngmodule-array-sorted';
export type MessageIds = 'sortedFailure';
const validProperties: (keyof NgModule)[] = [
  'bootstrap',
  'declarations',
  'entryComponents',
  'exports',
  'imports',
  'providers',
];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'NgModule property arrays should be alphabetized for easy visual scanning.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      sortedFailure:
        'NgModule property arrays should be sorted in ASC alphabetical order.',
    },
  },
  defaultOptions: [
    {
      type: '',
      prefix: '',
      style: '',
    },
  ],
  create(context) {
    return {
      [MODULE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        validProperties.forEach((prop: keyof NgModule) => {
          const initializer = getDecoratorPropertyValue(node, prop);
          if (
            !initializer ||
            !isArrayExpression(initializer) ||
            initializer.elements.length <= 1
          ) {
            return;
          }
          const elements = initializer.elements.filter(
            (e: TSESTree.Expression) => isIdentifier(e),
          );
          elements.forEach((e, i, list) => {
            if (i > 0 && isIdentifier(e)) {
              const previous = list[i - 1];
              if (
                isIdentifier(previous) &&
                e.name.localeCompare(previous.name) === -1
              ) {
                context.report({
                  node: previous,
                  messageId: 'sortedFailure',
                });
              }
            }
          });
        });
      },
    };
  },
});
