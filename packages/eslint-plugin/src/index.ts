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
import consistentComponentStyles, {
  RULE_NAME as consistentComponentStylesRuleName,
} from './rules/consistent-component-styles';
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
import noAsyncLifecycleMethod, {
  RULE_NAME as noAsyncLifecycleMethodRuleName,
} from './rules/no-async-lifecycle-method';
import noAttributeDecorator, {
  RULE_NAME as noAttributeDecoratorRuleName,
} from './rules/no-attribute-decorator';
import noConflictingLifecycle, {
  RULE_NAME as noConflictingLifecycleRuleName,
} from './rules/no-conflicting-lifecycle';
import noDuplicatesInMetadataArrays, {
  RULE_NAME as noDuplicatesInMetadataArraysRuleName,
} from './rules/no-duplicates-in-metadata-arrays';
import noEmptyLifecycleMethod, {
  RULE_NAME as noEmptyLifecycleMethodRuleName,
} from './rules/no-empty-lifecycle-method';
import noForwardRef, {
  RULE_NAME as noForwardRefRuleName,
} from './rules/no-forward-ref';
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
import noUncalledSignals, {
  RULE_NAME as noUncalledSignalsRuleName,
} from './rules/no-uncalled-signals';
import pipePrefix, {
  RULE_NAME as pipePrefixRuleName,
} from './rules/pipe-prefix';
import preferOnPushComponentChangeDetection, {
  RULE_NAME as preferOnPushComponentChangeDetectionRuleName,
} from './rules/prefer-on-push-component-change-detection';
import preferOutputEmitterRef, {
  RULE_NAME as preferOutputEmitterRefRuleName,
} from './rules/prefer-output-emitter-ref';
import preferOutputReadonly, {
  RULE_NAME as preferOutputReadonlyRuleName,
} from './rules/prefer-output-readonly';
import preferInject, {
  RULE_NAME as preferInjectRuleName,
} from './rules/prefer-inject';
import preferSignals, {
  RULE_NAME as preferSignalsRuleName,
} from './rules/prefer-signals';
import preferStandalone, {
  RULE_NAME as preferStandaloneRuleName,
} from './rules/prefer-standalone';
import relativeUrlPrefix, {
  RULE_NAME as relativeUrlPrefixRuleName,
} from './rules/relative-url-prefix';
import requireLifecycleOnPrototype, {
  RULE_NAME as requireLifecycleOnPrototypeRuleName,
} from './rules/require-lifecycle-on-prototype';
import requireLocalizeMetadata, {
  RULE_NAME as requireLocalizeMetadataRuleName,
} from './rules/require-localize-metadata';
import runtimeLocalize, {
  RULE_NAME as runtimeLocalizeRuleName,
} from './rules/runtime-localize';
import sortKeysInTypeDecorator, {
  RULE_NAME as sortKeysInTypeDecoratorRuleName,
} from './rules/sort-keys-in-type-decorator';
import sortLifecycleMethods, {
  RULE_NAME as sortLifecycleMethodsRuleName,
} from './rules/sort-lifecycle-methods';
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
import noExperimental, {
  RULE_NAME as noExperimentalRuleName,
} from './rules/no-experimental';
import noDeveloperPreview, {
  RULE_NAME as noDeveloperPreviewRuleName,
} from './rules/no-developer-preview';

export = {
  configs: {
    all,
    recommended,
  },
  rules: {
    [componentClassSuffixRuleName]: componentClassSuffix,
    [componentMaxInlineDeclarationsRuleName]: componentMaxInlineDeclarations,
    [componentSelectorRuleName]: componentSelector,
    [consistentComponentStylesRuleName]: consistentComponentStyles,
    [contextualDecoratorRuleName]: contextualDecorator,
    [contextualLifecycleRuleName]: contextualLifecycle,
    [directiveClassSuffixRuleName]: directiveClassSuffix,
    [directiveSelectorRuleName]: directiveSelector,
    [noAsyncLifecycleMethodRuleName]: noAsyncLifecycleMethod,
    [noAttributeDecoratorRuleName]: noAttributeDecorator,
    [noConflictingLifecycleRuleName]: noConflictingLifecycle,
    [noDuplicatesInMetadataArraysRuleName]: noDuplicatesInMetadataArrays,
    [noEmptyLifecycleMethodRuleName]: noEmptyLifecycleMethod,
    [noForwardRefRuleName]: noForwardRef,
    [noInputPrefixRuleName]: noInputPrefix,
    [noInputRenameRuleName]: noInputRename,
    [noInputsMetadataPropertyRuleName]: noInputsMetadataProperty,
    [noLifecycleCallRuleName]: noLifecycleCall,
    [noUncalledSignalsRuleName]: noUncalledSignals,
    [noOutputNativeRuleName]: noOutputNative,
    [noOutputOnPrefixRuleName]: noOutputOnPrefix,
    [noOutputRenameRuleName]: noOutputRename,
    [noOutputsMetadataPropertyRuleName]: noOutputsMetadataProperty,
    [noPipeImpureRuleName]: noPipeImpure,
    [noQueriesMetadataPropertyRuleName]: noQueriesMetadataProperty,
    [pipePrefixRuleName]: pipePrefix,
    [preferOnPushComponentChangeDetectionRuleName]:
      preferOnPushComponentChangeDetection,
    [preferSignalsRuleName]: preferSignals,
    [preferStandaloneRuleName]: preferStandalone,
    [preferInjectRuleName]: preferInject,
    [preferOutputEmitterRefRuleName]: preferOutputEmitterRef,
    [preferOutputReadonlyRuleName]: preferOutputReadonly,
    [relativeUrlPrefixRuleName]: relativeUrlPrefix,
    [requireLifecycleOnPrototypeRuleName]: requireLifecycleOnPrototype,
    [requireLocalizeMetadataRuleName]: requireLocalizeMetadata,
    [runtimeLocalizeRuleName]: runtimeLocalize,
    [sortKeysInTypeDecoratorRuleName]: sortKeysInTypeDecorator,
    [sortLifecycleMethodsRuleName]: sortLifecycleMethods,
    [useComponentSelectorRuleName]: useComponentSelector,
    [useComponentViewEncapsulationRuleName]: useComponentViewEncapsulation,
    [useInjectableProvidedInRuleName]: useInjectableProvidedIn,
    [useLifecycleInterfaceRuleName]: useLifecycleInterface,
    [usePipeTransformInterfaceRuleName]: usePipeTransformInterface,
    [noExperimentalRuleName]: noExperimental,
    [noDeveloperPreviewRuleName]: noDeveloperPreview,
  },
};
