import processors from './processors';
import bananaInABox, {
  RULE_NAME as bananaInABoxRuleName,
} from './rules/banana-in-a-box';
import noNegatedAsync, {
  RULE_NAME as noNegatedAsyncRuleName,
} from './rules/no-negated-async';

export default {
  processors,
  rules: {
    [bananaInABoxRuleName]: bananaInABox,
    [noNegatedAsyncRuleName]: noNegatedAsync,
  },
};
