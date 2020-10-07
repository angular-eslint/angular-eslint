import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import templateSrc from '~eslint-plugin-template/src';
import src from '~eslint-plugin/src';
import { getAngularESLintPRs, getCodelyzerRulesList } from './helpers';
import { CodelyzerRule, PRDetails, RuleDetails } from './interfaces';

/**
 * Stores a mapping from codelyzer rules to eslint rules that have changed name.
 */
const RULE_MAP = {
  'template-accessibility-tabindex-no-positive': 'no-positive-tabindex',
};

/**
 * Stores a map from status text to emoji
 */
const keyLegend = {
  done: ':white_check_mark:',
  'work in progress': ':construction:',
};

/**
 * Stores static text elements for the readme.
 */
const staticElements = {
  rulesListKey: Object.keys(keyLegend).map(
    (key) => `${keyLegend[key]} = ${key}`,
  ),
  legendSpacerRow: '-----',
  ruleHeaderRow: ['Codelyzer rule', 'Status'],
  ruleSpacerRow: ['-----', ':-:'],
  listBeginMarker: `<!-- begin rule list -->`,
  listEndMarker: `<!-- end rule list -->`,
};

/**
 * @description
 * Returns a PR for the specified rule if one exists. Otherwise returns undefined.
 *
 * A PR is matched if the title starts with 'feat(eslint-plugin)' and the title contains the rule name.
 *
 * @param rule the CodelyzerRule to find a PR for.
 * @param currentPrs the current list of PRs
 * @returns a PRDetail if it matches the rule otherwise returns undefined.
 */
const findPR = (rule: CodelyzerRule, currentPrs: PRDetails[]) =>
  currentPrs.find(
    ({ title }) =>
      title.startsWith('feat(eslint-plugin)') && title.match(rule.ruleName),
  );

/**
 * @description
 * Maps the specified RuleDetails to a markdown list of links to codelyzer docs.
 *
 * @param rules an Array of RuleDetails to map
 * @returns an Array of strings representing the list of links to codelyzer docs.
 */
const buildRelativeLinksList = (rules: RuleDetails[]) =>
  rules.map(({ name }) => `[\`${name}\`]: https://codelyzer.com/rules/${name}`);

/**
 * @description
 * Maps the specified PRDetails to a markdown list of links to PRs.
 *
 * @param prs an Array of PRDetails to map.
 * @returns an Array of strings representing the list of links to PRs.
 */
const buildPRLinksList = (prs: PRDetails[]) =>
  prs.map(({ url, number }) => `[\`PR${number}\`]: ${url}`);

/**
 * @description
 * Returns an Array of strings representing the markdown rows for the Legend table.
 *
 * @returns an Array of strings representing the markdown rows for the Legend table.
 */
const buildLegendTable = () => [
  '| |',
  `|${staticElements.legendSpacerRow}|`,
  ...staticElements.rulesListKey.map((key) => `|${key}|`),
];

/**
 * @description
 * Returns an Array of strings representing the markdown rows for a rules list table.
 *
 * @param rules an Array of RuleDetails to map
 * @returns an Array of strings representing the markdown rows for a rules list table.
 */
const ruleList = (rules: RuleDetails[]) =>
  rules.map(({ name, done, pr }) =>
    [
      `[\`${name}\`]`,
      done
        ? keyLegend.done
        : pr
        ? `[${keyLegend['work in progress']}][\`PR${pr.number}\`]`
        : '|',
    ].join('|'),
  );

/**
 * @description
 * Returns an Array of strings representing the markdown tables for each Codelyzer Rule Type.
 *
 * @param rules an Array of RuleDetails to map
 * @returns an Array of strings representing the markdown tables for each Codelyzer Rule Type.
 */
const buildRulesTables = (rules: RuleDetails[]) => {
  const ruleTypes = [...new Set(rules.map(({ type }) => type))].sort();

  const sections = ruleTypes.map((ruleType) =>
    [
      `#### ${ruleType.charAt(0).toUpperCase()}${ruleType.slice(1)}`,
      '',
      staticElements.ruleHeaderRow.join('|'),
      staticElements.ruleSpacerRow.join('|'),
      ...ruleList(rules.filter((rule) => rule.type === ruleType)),
      '',
    ].join('\n'),
  );

  return sections;
};

/**
 * @description
 * Updates the specified markdown with the rules list and returns the result string.
 *
 * Markdown must contain the <!-- begin rule list --> and <!-- end rule list --> tags
 *
 * @param rules an Array of RuleDetails to update the markdown with.
 * @param markdown a string representing the markdown to update.
 * @returns a string representing the modified markdown.
 */
const updateRulesList = (rules: RuleDetails[], markdown: string): string => {
  const listStartIndex = markdown.indexOf(staticElements.listBeginMarker);
  const listEndIndex = markdown.indexOf(staticElements.listEndMarker);

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error(`cannot find start or end of rules list`);
  }

  return [
    markdown.substring(0, listStartIndex - 1),
    staticElements.listBeginMarker,
    '',
    ...buildLegendTable(),
    '',
    ...buildRulesTables(rules),
    '',
    '<!-- Codelyzer Links -->',
    '',
    ...buildRelativeLinksList(rules),
    '',
    '<!-- PR Links -->',
    '',
    ...buildPRLinksList(
      rules.map((rule) => rule.pr).filter((pr) => pr !== undefined),
    ),
    markdown.substring(listEndIndex),
  ].join('\n');
};

/**
 * @description
 * Returns an Array of RuleDetails for the specified CodelyzerRule array.
 *
 * @param codelyzerRules an Array of CodelyzerRules to convert to RuleDetails
 * @param rules a map of RuleModules for the ESLint project that have been completed.
 * @param currentPrs an Array of PRDetails
 * @returns an Array of RuleDetails for the specified CodelyzerRule array.
 */
const createRuleDetails = (
  codelyzerRules: CodelyzerRule[],
  rules: typeof src['rules'] | typeof templateSrc['rules'],
  currentPrs: PRDetails[],
) => {
  const isDone = (ruleName: string) =>
    (rules[ruleName] ||
      rules[RULE_MAP[ruleName]] ||
      rules[ruleName.replace(/^template\-/, '')]) !== undefined;

  return codelyzerRules.map((rule) => ({
    name: rule.ruleName,
    type: rule.type,
    done: isDone(rule.ruleName),
    pr: findPR(rule, currentPrs),
  }));
};

/**
 * @description
 * Returns the Rules List section from the specified markdown.
 *
 * @param markdown a string representing the markdown to retrieve the rules list from.
 */
const getRulesListMarkdown = (markdown: string) => {
  const listStartIndex = markdown.indexOf(staticElements.listBeginMarker);
  const listEndIndex = markdown.indexOf(staticElements.listEndMarker);

  return markdown.substring(
    listStartIndex,
    listEndIndex + staticElements.listEndMarker.length,
  );
};

/**
 * @description
 * Generates a Rules List for the README in the following format:
 *
 * <!-- begin rule list -->
 *
 * #### Type
 * | Codelyzer rule | Status |
 * | -------------- | :----: |
 * | [`Rule name`] | <status emoji> |
 *
 * <!-- Relative Links -->
 * [`Rule name`]: <link to codelyzer docs>
 *
 * <!-- PR Links -->
 * [`pr<number>`]: <link to pr>
 *
 * <!-- end rule list -->
 *
 * @async
 */
const generateReadme = async (readme: string) => {
  const codelyzerRules = await getCodelyzerRulesList();
  const currentPrs = await getAngularESLintPRs();
  const templatePrefix = 'template-';
  const pluginRuleDetails = createRuleDetails(
    codelyzerRules.filter((rule) => !rule.ruleName.startsWith(templatePrefix)),
    src.rules,
    currentPrs,
  );
  const templateRuleDetails = createRuleDetails(
    codelyzerRules.filter((rule) => rule.ruleName.startsWith(templatePrefix)),
    templateSrc.rules,
    currentPrs,
  );
  const ruleDetails = pluginRuleDetails
    .concat(templateRuleDetails)
    .sort(({ name: ruleNameA }, { name: ruleNameB }) =>
      ruleNameA.localeCompare(ruleNameB),
    );

  let nextReadme = updateRulesList(ruleDetails, readme);
  nextReadme = prettier.format(nextReadme, { parser: 'markdown' });

  return nextReadme;
};

/**
 * @description
 * Returns a string representing the path to the root README.md file.
 */
const getReadmePath = () => path.resolve(process.cwd(), 'README.md');

/**
 * @description
 * Updates the README.md file in the root directory with the Rules List. Returns true if successful.
 *
 * @async
 */
export const updateReadme = async () => {
  try {
    const readmeFile = getReadmePath();

    let readme = fs.readFileSync(readmeFile, 'utf8');
    readme = await generateReadme(readme);

    fs.writeFileSync(readmeFile, readme, 'utf8');

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @description
 * Determines whether or not the README needs updates. Returns true if it does not.
 *
 * @async
 */
export const checkReadme = async () => {
  try {
    const readmeFile = getReadmePath();

    const readme = fs.readFileSync(readmeFile, 'utf8');
    const nextReadme = await generateReadme(readme);

    const originalRulesList = getRulesListMarkdown(readme);
    const nextRulesList = getRulesListMarkdown(nextReadme);

    if (originalRulesList !== nextRulesList) {
      throw new Error(
        'Please update the README before pushing: `yarn update-readme`.',
      );
    }

    return true;
  } catch (err) {
    console.error(`\x1b[31m%s\x1b[0m`, err.message);
    return false;
  }
};
