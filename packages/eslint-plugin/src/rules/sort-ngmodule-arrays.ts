import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { MODULE_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorPropertyValue,
  isArrayExpression,
  isIdentifier,
} from '../utils/utils';

import { NgModule } from '@angular/compiler/src/core';

type Options = [];
export const RULE_NAME = 'sort-ngmodule-arrays';
export type MessageIds = 'sortNgmoduleArrays';
const validProperties: (keyof NgModule)[] = [
  'bootstrap',
  'declarations',
  'entryComponents',
  'exports',
  'imports',
  'providers',
  'schemas',
];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces ASC alphabetical order for NgModule metadata arrays for easy visual scanning',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      sortNgmoduleArrays:
        'NgModule metadata arrays should be sorted in ASC alphabetical order',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [MODULE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        validProperties.forEach((prop: keyof NgModule) => {
          const initializer = getDecoratorPropertyValue(node, prop);
          if (
            !initializer ||
            !isArrayExpression(initializer) ||
            initializer.elements.length < 2
          ) {
            return;
          }
          const unorderedNode = initializer.elements
            .filter(isIdentifier)
            .find(
              ({ name }, index, list) =>
                name.localeCompare(list[index + 1]?.name) === 1,
            );
          if (!unorderedNode) return;
          context.report({
            messageId: 'sortNgmoduleArrays',
            node: unorderedNode,
          });
        });
      },
    };
  },
});
