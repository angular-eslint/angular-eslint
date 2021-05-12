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
          const unorderedNode = initializer.elements
            .filter(isIdentifier)
            .find(({ name }, index, list) => {
              const nextElementName = list[index + 1]?.name;
              return (
                nextElementName && name.localeCompare(nextElementName) === 1
              );
            });
          if (!unorderedNode) return;
          context.report({
            messageId: 'sortNgmoduleMetadataArrays',
            node: unorderedNode,
          });
        });
      },
    };
  },
});
