import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds =
  | 'preferOnPushComponentChangeDetection'
  | 'suggestChangeToOnPush';
export const RULE_NAME = 'prefer-on-push-component-change-detection';

const METADATA_PROPERTY_NAME = 'changeDetection';
const STRATEGY_ON_PUSH = 'ChangeDetectionStrategy.OnPush';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures components do not opt out of the default \`${STRATEGY_ON_PUSH}\` change detection strategy`,
      recommended: 'recommended',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferOnPushComponentChangeDetection: `Components should not opt out of the default \`${STRATEGY_ON_PUSH}\` change detection strategy`,
      suggestChangeToOnPush: `Change to \`${STRATEGY_ON_PUSH}\``,
    },
  },
  defaultOptions: [],
  create(context) {
    const changeDetectionMetadataProperty = Selectors.metadataProperty(
      METADATA_PROPERTY_NAME,
    );
    /**
     * As of Angular v22 OnPush is the default change detection strategy, so a
     * component only needs to be reported when it explicitly opts out of it by
     * setting a non-OnPush `ChangeDetectionStrategy` member (e.g. `Eager`, or
     * the deprecated `Default`). Omitting `changeDetection` entirely, or setting
     * it to `ChangeDetectionStrategy.OnPush`, is the desired default and is not
     * reported.
     */
    const onPushOptOutProperty =
      `${Selectors.COMPONENT_CLASS_DECORATOR} > CallExpression > ObjectExpression > ${changeDetectionMetadataProperty}[value.object.name='ChangeDetectionStrategy'][value.property.name!='OnPush']` as const;

    return {
      [onPushOptOutProperty](node: TSESTree.Property) {
        const { value } = node;

        // The selector guarantees a `ChangeDetectionStrategy.<member>` value;
        // this narrows the type for the fixer.
        if (!ASTUtils.isMemberExpression(value)) {
          return;
        }

        context.report({
          node: value.property,
          messageId: 'preferOnPushComponentChangeDetection',
          suggest: [
            {
              messageId: 'suggestChangeToOnPush',
              fix: (fixer) => fixer.replaceText(value.property, 'OnPush'),
            },
          ],
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale: `As of Angular v22, \`${STRATEGY_ON_PUSH}\` is the default change detection strategy: a component that does not specify \`${METADATA_PROPERTY_NAME}\` is checked using OnPush. This brings new code in line with zoneless being the default and with Angular's goal of performance by default, and means it is no longer necessary to set \`${STRATEGY_ON_PUSH}\` explicitly. The previous default, \`ChangeDetectionStrategy.Default\`, has been renamed to \`ChangeDetectionStrategy.Eager\`. When you run \`ng update\`, the v22 migration adds an explicit \`ChangeDetectionStrategy.Eager\` to existing components that relied on the old implicit default, so that they keep behaving as before.\n\nBecause omitting \`${METADATA_PROPERTY_NAME}\` (or setting it to \`${STRATEGY_ON_PUSH}\`) already gives you OnPush, this rule does not require you to declare it. Instead it reports components that explicitly opt out of OnPush by setting \`ChangeDetectionStrategy.Eager\` (or the deprecated \`ChangeDetectionStrategy.Default\`) — including the components the migration marked as \`Eager\` — so you can review them and adopt OnPush where it is safe to do so. Note that switching a component from eager checking to OnPush can change its runtime behaviour, so apply the suggestion deliberately and make sure the component uses immutable data patterns (creating new object references when data changes).`,
};
