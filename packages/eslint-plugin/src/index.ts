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
import noOutputOnPrefix, {
  RULE_NAME as noOutputOnPrefixRuleName,
} from './rules/no-output-on-prefix';
import noHostMetadataProperty, {
  RULE_NAME as noHostMetadataPropertyRuleName,
} from './rules/no-host-metadata-property';
import noInputsMetadataProperty, {
  RULE_NAME as noInputsMetadataPropertyRuleName,
} from './rules/no-inputs-metadata-property';
import noOutputsMetadataProperty, {
  RULE_NAME as noOutputsMetadataPropertyRuleName,
} from './rules/no-outputs-metadata-property';
import noQueriesMetadataProperty, {
  RULE_NAME as noQueriesMetadataPropertyRuleName,
} from './rules/no-queries-metadata-property';
import componentClassSuffix, {
  RULE_NAME as componentClassSuffixRuleName,
} from './rules/component-class-suffix';

export default {
  rules: {
    [useComponentSelectorRuleName]: useComponentSelector,
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
  },
};
