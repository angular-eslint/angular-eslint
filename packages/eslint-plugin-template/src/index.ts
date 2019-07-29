import processors from './processors';
import bananaInABox, {
  RULE_NAME as bananaInABoxRuleName,
} from './rules/banana-in-a-box';

export default {
  processors,
  rules: {
    [bananaInABoxRuleName]: bananaInABox,
  },
};
