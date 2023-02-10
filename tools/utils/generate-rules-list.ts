import templateSrc from '@angular-eslint/eslint-plugin-template/src';
import src from '@angular-eslint/eslint-plugin/src';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import {
  getAngularESLintPRs,
  getCodelyzerRulesList,
} from './github-api-helpers';
import type { CodelyzerRule, PRDetails } from './interfaces';

/**
 * Represents status details for an ESLint Rule.
 */
interface RuleDetails {
  name: string;
  eslintName: string;
  type: CodelyzerRule['type'];
  wontFix: boolean;
  done: boolean;
  pr: PRDetails | undefined;
}

/**
 * We will not be maintaining conversions of the following rules because
 * they are formatting based. Use prettier y'all!
 */
const wontFixList = [
  'angular-whitespace',
  'import-destructuring-spacing',
  'prefer-inline-decorator',
  'use-pipe-decorator',
];

/**
 * Stores a mapping from codelyzer rules to eslint rules that have changed name.
 */
const RULE_MAP = {
  'template-accessibility-tabindex-no-positive': 'no-positive-tabindex',
} as const;

/**
 * Stores a map from status text to emoji
 */
const keyLegend = {
  done: {
    emoji: ':white_check_mark:',
    description: 'We have created an ESLint equivalent of this TSLint rule',
  },
  wip: {
    emoji: ':construction:',
    description:
      'There is an open PR to provide an ESLint equivalent of this TSLint rule',
  },
  wontFix: {
    emoji: ':no_good:',
    description:
      'This TSLint rule has been replaced by functionality within the Angular compiler, or should be replaced by a dedicated code formatter, such as Prettier',
  },
} as const;

/**
 * Stores static text elements for the readme.
 */
const staticElements = {
  rulesListKey: Object.values(keyLegend).map(
    ({ emoji, description }) => `${emoji} = ${description}`,
  ),
  legendSpacerRow: '-----',
  ruleHeaderRow: ['Codelyzer Rule', 'ESLint Equivalent', 'Status'],
  ruleSpacerRow: ['-----', ':-:'],
  listBeginMarker: `<!-- begin rule list -->`,
  listEndMarker: `<!-- end rule list -->`,
} as const;

/**
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
 * Maps the specified RuleDetails to a markdown list of links to codelyzer docs.
 *
 * @param rules an Array of RuleDetails to map
 * @returns an Array of strings representing the list of links to codelyzer docs.
 */
const buildRelativeLinksList = (rules: RuleDetails[]) =>
  rules.map(({ name }) => `[\`${name}\`]: http://codelyzer.com/rules/${name}`);

/**
 * Maps the specified PRDetails to a markdown list of links to PRs.
 *
 * @param prs an Array of PRDetails to map.
 * @returns an Array of strings representing the list of links to PRs.
 */
const buildPRLinksList = (prs: PRDetails[]) =>
  prs.map(({ url, number }) => `[\`PR${number}\`]: ${url}`);

/**
 * Returns an Array of strings representing the markdown rows for the Legend table.
 *
 * @returns an Array of strings representing the markdown rows for the Legend table.
 */
const buildLegendTable = () => [
  '| Explanation of Statuses |',
  `|${staticElements.legendSpacerRow}|`,
  ...staticElements.rulesListKey.map((key) => `|${key}|`),
];

/**
 * Returns an Array of strings representing the markdown rows for a rules list table.
 *
 * @param rules an Array of RuleDetails to map
 * @returns an Array of strings representing the markdown rows for a rules list table.
 */
const ruleList = (rules: RuleDetails[]) =>
  rules.map(({ name, eslintName, wontFix, done, pr }) =>
    [
      `[\`${name}\`]`,
      wontFix ? 'N/A, see explanation above' : eslintName,
      wontFix
        ? keyLegend.wontFix.emoji
        : done
        ? keyLegend.done.emoji
        : pr
        ? `[${keyLegend.wip.emoji}][\`PR${pr.number}\`]`
        : '|',
    ].join('|'),
  );

/**
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
  isTemplateRules: boolean,
): RuleDetails[] => {
  function getESLintName(ruleName: string): string {
    if (rules[ruleName]) {
      return `@angular-eslint/${ruleName}`;
    }
    if (rules[RULE_MAP[ruleName]]) {
      return `@angular-eslint/${isTemplateRules ? 'template/' : ''}${
        RULE_MAP[ruleName]
      }`;
    }
    if (rules[ruleName.replace(/^template-/, '')]) {
      return `@angular-eslint/template/${ruleName.replace(/^template-/, '')}`;
    }
    return '';
  }

  return codelyzerRules.map((rule) => {
    const eslintName = getESLintName(rule.ruleName);
    return {
      name: rule.ruleName,
      eslintName,
      wontFix: wontFixList.includes(rule.ruleName),
      type: rule.type,
      done: !!eslintName,
      pr: findPR(rule, currentPrs),
    };
  });
};

const README_PATH = path.resolve(process.cwd(), 'README.md');

export function readExistingReadmeFile(): string {
  return fs.readFileSync(README_PATH, 'utf8');
}

export function updateReadmeFile(updatedContents: string): void {
  fs.writeFileSync(README_PATH, updatedContents, 'utf8');
}

/**
 * Regenerate the Rules List for the README in the following format:
 *
 * <!-- begin rule list -->
 *
 * ...TABLES WITH RULE STATUSES...
 *
 * <!-- Relative Links -->
 * [`Rule name`]: <link to codelyzer docs>
 *
 * <!-- PR Links -->
 * [`pr<number>`]: <link to pr>
 *
 * <!-- end rule list -->
 */
export const regenerateReadmeRulesList = async (): Promise<string> => {
  const existingReadme = readExistingReadmeFile();

  const codelyzerRules = await getCodelyzerRulesList();
  const currentPrs = await getAngularESLintPRs();

  const templatePrefix = 'template-';

  const pluginRuleDetails = createRuleDetails(
    codelyzerRules.filter((rule) => !rule.ruleName.startsWith(templatePrefix)),
    src.rules,
    currentPrs,
    false,
  );

  const templateRuleDetails = createRuleDetails(
    codelyzerRules.filter((rule) => rule.ruleName.startsWith(templatePrefix)),
    templateSrc.rules,
    currentPrs,
    true,
  );

  const ruleDetails = pluginRuleDetails
    .concat(templateRuleDetails)
    .sort(({ name: ruleNameA }, { name: ruleNameB }) =>
      ruleNameA.localeCompare(ruleNameB),
    );

  let updatedReadme = updateRulesList(ruleDetails, existingReadme);
  updatedReadme = prettier.format(updatedReadme, { parser: 'markdown' });

  return updatedReadme;
};
