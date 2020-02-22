import componentClassSuffix, {
  RULE_NAME as componentClassSuffixRuleName,
} from './rules/component-class-suffix';
import componentMaxInlineDeclarations, {
  RULE_NAME as componentMaxInlineDeclarationsRuleName,
} from './rules/component-max-inline-declarations';
import componentSelector, {
  RULE_NAME as componentSelectorRuleName,
} from './rules/component-selector';
import contextualLifecycle, {
  RULE_NAME as contextualLifecycleRuleName,
} from './rules/contextual-lifecycle';
import directiveSelector, {
  RULE_NAME as directiveSelectorRuleName,
} from './rules/directive-selector';
import noConflictingLifecycle, {
  RULE_NAME as noConflictingLifecycleRuleName,
} from './rules/no-conflicting-lifecycle';
import noHostMetadataProperty, {
  RULE_NAME as noHostMetadataPropertyRuleName,
} from './rules/no-host-metadata-property';
import noInputsMetadataProperty, {
  RULE_NAME as noInputsMetadataPropertyRuleName,
} from './rules/no-inputs-metadata-property';
import noLifecycleCall, {
  RULE_NAME as noLifecycleCallRuleName,
} from './rules/no-lifecycle-call';
import noOutputNative, {
  RULE_NAME as noOutputNativeRuleName,
} from './rules/no-output-native';
import noOutputOnPrefix, {
  RULE_NAME as noOutputOnPrefixRuleName,
} from './rules/no-output-on-prefix';
import noOutputRename, {
  RULE_NAME as noOutputRenameRuleName,
} from './rules/no-output-rename';
import noInputRename, {
  RULE_NAME as noInputRenameRuleName,
} from './rules/no-input-rename';
import noOutputsMetadataProperty, {
  RULE_NAME as noOutputsMetadataPropertyRuleName,
} from './rules/no-outputs-metadata-property';
import noPipeImpure, {
  RULE_NAME as noPipeImpureRuleName,
} from './rules/no-pipe-impure';
import noQueriesMetadataProperty, {
  RULE_NAME as noQueriesMetadataPropertyRuleName,
} from './rules/no-queries-metadata-property';
import preferOnPushComponentChangeDetection, {
  RULE_NAME as preferOnPushComponentChangeDetectionRuleName,
} from './rules/prefer-on-push-component-change-detection';
import useComponentSelector, {
  RULE_NAME as useComponentSelectorRuleName,
} from './rules/use-component-selector';
import useComponentViewEncapsulation, {
  RULE_NAME as useComponentViewEncapsulationRuleName,
} from './rules/use-component-view-encapsulation';
import useLifecycleInterface, {
  RULE_NAME as useLifecycleInterfaceRuleName,
} from './rules/use-lifecycle-interface';
import usePipeDecorator, {
  RULE_NAME as usePipeDecoratorRuleName,
} from './rules/use-pipe-decorator';
import usePipeTransformInterface, {
  RULE_NAME as usePipeTransformInterfaceRuleName,
} from './rules/use-pipe-transform-interface';

export default {
  rules: {
    [componentClassSuffixRuleName]: componentClassSuffix,
    [componentMaxInlineDeclarationsRuleName]: componentMaxInlineDeclarations,
    [componentSelectorRuleName]: componentSelector,
    [contextualLifecycleRuleName]: contextualLifecycle,
    [directiveSelectorRuleName]: directiveSelector,
    [noConflictingLifecycleRuleName]: noConflictingLifecycle,
    [noHostMetadataPropertyRuleName]: noHostMetadataProperty,
    [noInputsMetadataPropertyRuleName]: noInputsMetadataProperty,
    [noLifecycleCallRuleName]: noLifecycleCall,
    [noOutputNativeRuleName]: noOutputNative,
    [noOutputOnPrefixRuleName]: noOutputOnPrefix,
    [noOutputRenameRuleName]: noOutputRename,
    [noInputRenameRuleName]: noInputRename,
    [noOutputsMetadataPropertyRuleName]: noOutputsMetadataProperty,
    [noPipeImpureRuleName]: noPipeImpure,
    [noQueriesMetadataPropertyRuleName]: noQueriesMetadataProperty,
    [preferOnPushComponentChangeDetectionRuleName]: preferOnPushComponentChangeDetection,
    [useComponentSelectorRuleName]: useComponentSelector,
    [useComponentViewEncapsulationRuleName]: useComponentViewEncapsulation,
    [useLifecycleInterfaceRuleName]: useLifecycleInterface,
    [usePipeDecoratorRuleName]: usePipeDecorator,
    [usePipeTransformInterfaceRuleName]: usePipeTransformInterface,
  },
};
