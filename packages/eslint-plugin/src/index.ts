import all from './configs/all.json';
import recommended from './configs/recommended.json';

import componentClassSuffix, {
  RULE_NAME as componentClassSuffixRuleName,
} from './rules/component-class-suffix';
import componentMaxInlineDeclarations, {
  RULE_NAME as componentMaxInlineDeclarationsRuleName,
} from './rules/component-max-inline-declarations';
import componentSelector, {
  RULE_NAME as componentSelectorRuleName,
} from './rules/component-selector';
import contextualDecorator, {
  RULE_NAME as contextualDecoratorRuleName,
} from './rules/contextual-decorator';
import contextualLifecycle, {
  RULE_NAME as contextualLifecycleRuleName,
} from './rules/contextual-lifecycle';
import directiveClassSuffix, {
  RULE_NAME as directiveClassSuffixRuleName,
} from './rules/directive-class-suffix';
import directiveSelector, {
  RULE_NAME as directiveSelectorRuleName,
} from './rules/directive-selector';
import noAttributeDecorator, {
  RULE_NAME as noAttributeDecoratorRuleName,
} from './rules/no-attribute-decorator';
import noConflictingLifecycle, {
  RULE_NAME as noConflictingLifecycleRuleName,
} from './rules/no-conflicting-lifecycle';
import noEmptyLifecycleMethod, {
  RULE_NAME as noEmptyLifecycleMethodRuleName,
} from './rules/no-empty-lifecycle-method';
import noForwardRef, {
  RULE_NAME as noForwardRefRuleName,
} from './rules/no-forward-ref';
import noHostMetadataProperty, {
  RULE_NAME as noHostMetadataPropertyRuleName,
} from './rules/no-host-metadata-property';
import noInputPrefix, {
  RULE_NAME as noInputPrefixRuleName,
} from './rules/no-input-prefix';
import noInputRename, {
  RULE_NAME as noInputRenameRuleName,
} from './rules/no-input-rename';
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
import noOutputsMetadataProperty, {
  RULE_NAME as noOutputsMetadataPropertyRuleName,
} from './rules/no-outputs-metadata-property';
import noPipeImpure, {
  RULE_NAME as noPipeImpureRuleName,
} from './rules/no-pipe-impure';
import noQueriesMetadataProperty, {
  RULE_NAME as noQueriesMetadataPropertyRuleName,
} from './rules/no-queries-metadata-property';
import pipePrefix, {
  RULE_NAME as pipePrefixRuleName,
} from './rules/pipe-prefix';
import preferOnPushComponentChangeDetection, {
  RULE_NAME as preferOnPushComponentChangeDetectionRuleName,
} from './rules/prefer-on-push-component-change-detection';
import preferOutputReadonly, {
  RULE_NAME as preferOutputReadonlyRuleName,
} from './rules/prefer-output-readonly';
import relativeUrlPrefix, {
  RULE_NAME as relativeUrlPrefixRuleName,
} from './rules/relative-url-prefix';
import sortNgmoduleMetadataArrays, {
  RULE_NAME as sortNgmoduleMetadataArraysName,
} from './rules/sort-ngmodule-metadata-arrays';
import useComponentSelector, {
  RULE_NAME as useComponentSelectorRuleName,
} from './rules/use-component-selector';
import useComponentViewEncapsulation, {
  RULE_NAME as useComponentViewEncapsulationRuleName,
} from './rules/use-component-view-encapsulation';
import useInjectableProvidedIn, {
  RULE_NAME as useInjectableProvidedInRuleName,
} from './rules/use-injectable-provided-in';
import useLifecycleInterface, {
  RULE_NAME as useLifecycleInterfaceRuleName,
} from './rules/use-lifecycle-interface';
import usePipeTransformInterface, {
  RULE_NAME as usePipeTransformInterfaceRuleName,
} from './rules/use-pipe-transform-interface';

export = {
  configs: {
    all,
    recommended,
  },
  rules: {
    [contextualDecoratorRuleName]: contextualDecorator,
    [componentClassSuffixRuleName]: componentClassSuffix,
    [componentMaxInlineDeclarationsRuleName]: componentMaxInlineDeclarations,
    [componentSelectorRuleName]: componentSelector,
    [contextualLifecycleRuleName]: contextualLifecycle,
    [directiveClassSuffixRuleName]: directiveClassSuffix,
    [directiveSelectorRuleName]: directiveSelector,
    [noAttributeDecoratorRuleName]: noAttributeDecorator,
    [noConflictingLifecycleRuleName]: noConflictingLifecycle,
    [noForwardRefRuleName]: noForwardRef,
    [noHostMetadataPropertyRuleName]: noHostMetadataProperty,
    [noInputPrefixRuleName]: noInputPrefix,
    [noInputRenameRuleName]: noInputRename,
    [noInputsMetadataPropertyRuleName]: noInputsMetadataProperty,
    [noLifecycleCallRuleName]: noLifecycleCall,
    [noOutputNativeRuleName]: noOutputNative,
    [noOutputOnPrefixRuleName]: noOutputOnPrefix,
    [noOutputRenameRuleName]: noOutputRename,
    [noOutputsMetadataPropertyRuleName]: noOutputsMetadataProperty,
    [noPipeImpureRuleName]: noPipeImpure,
    [noQueriesMetadataPropertyRuleName]: noQueriesMetadataProperty,
    [noEmptyLifecycleMethodRuleName]: noEmptyLifecycleMethod,
    [preferOnPushComponentChangeDetectionRuleName]:
      preferOnPushComponentChangeDetection,
    [preferOutputReadonlyRuleName]: preferOutputReadonly,
    [relativeUrlPrefixRuleName]: relativeUrlPrefix,
    [sortNgmoduleMetadataArraysName]: sortNgmoduleMetadataArrays,
    [useComponentSelectorRuleName]: useComponentSelector,
    [useComponentViewEncapsulationRuleName]: useComponentViewEncapsulation,
    [useInjectableProvidedInRuleName]: useInjectableProvidedIn,
    [useLifecycleInterfaceRuleName]: useLifecycleInterface,
    [usePipeTransformInterfaceRuleName]: usePipeTransformInterface,
    [pipePrefixRuleName]: pipePrefix,
  },
};
