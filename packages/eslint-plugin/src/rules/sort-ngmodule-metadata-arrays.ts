import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { MODULE_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorPropertyValue,
  isArrayExpression,
  isIdentifier,
} from '../utils/utils';

import type { NgModule } from '@angular/compiler/src/core';

type Options = [];
export const RULE_NAME = 'sort-ngmodule-metadata-arrays';
export type MessageIds = 'sortNgmoduleMetadataArrays';
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
    fixable: 'code',
    schema: [],
    messages: {
      sortNgmoduleMetadataArrays:
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
          const unorderedNodes = initializer.elements
            .filter(isIdentifier)
            .map((current, index, list) => {
              return [current, list[index + 1]];
            })
            .find(([current, next]) => {
              return next && current.name.localeCompare(next.name) === 1;
            });
          if (!unorderedNodes) return;

          const [unorderedNode, nextNode] = unorderedNodes;
          context.report({
            messageId: 'sortNgmoduleMetadataArrays',
            node: unorderedNode,
            fix: (fixer) => {
              return [
                fixer.replaceText(unorderedNode, nextNode.name),
                fixer.replaceText(nextNode, unorderedNode.name),
              ];
            },
          });
        });
      },
    };
  },
});
