import componentClassSuffix, {
  RULE_NAME as componentClassSuffixRuleName,
} from './rules/component-class-suffix';
import contextualLifecycle, {
  RULE_NAME as contextualLifecycleRuleName,
} from './rules/contextual-lifecycle';
import noHostMetadataProperty, {
  RULE_NAME as noHostMetadataPropertyRuleName,
} from './rules/no-host-metadata-property';
import noInputsMetadataProperty, {
  RULE_NAME as noInputsMetadataPropertyRuleName,
} from './rules/no-inputs-metadata-property';
import noOutputOnPrefix, {
  RULE_NAME as noOutputOnPrefixRuleName,
} from './rules/no-output-on-prefix';
import noOutputNative, {
  RULE_NAME as noOutputNativeRuleName,
} from './rules/no-output-native';
import noOutputRename, {
  RULE_NAME as noOutputRenameRuleName,
} from './rules/no-output-rename';
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
    [useComponentSelectorRuleName]: useComponentSelector,
    [contextualLifecycleRuleName]: contextualLifecycle,
    [useComponentViewEncapsulationRuleName]: useComponentViewEncapsulation,
    [useLifecycleInterfaceRuleName]: useLifecycleInterface,
    [usePipeDecoratorRuleName]: usePipeDecorator,
    [usePipeTransformInterfaceRuleName]: usePipeTransformInterface,
    [noOutputOnPrefixRuleName]: noOutputOnPrefix,
    [noHostMetadataPropertyRuleName]: noHostMetadataProperty,
    [noInputsMetadataPropertyRuleName]: noInputsMetadataProperty,
    [noOutputsMetadataPropertyRuleName]: noOutputsMetadataProperty,
    [noQueriesMetadataPropertyRuleName]: noQueriesMetadataProperty,
    [componentClassSuffixRuleName]: componentClassSuffix,
    [noPipeImpureRuleName]: noPipeImpure,
    [preferOnPushComponentChangeDetectionRuleName]: preferOnPushComponentChangeDetection,
    [noOutputRenameRuleName]: noOutputRename,
    [noOutputNativeRuleName]: noOutputNative,
  },
};
