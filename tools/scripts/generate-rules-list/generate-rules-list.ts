#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import src from '../../../packages/eslint-plugin/src';
import { getAngularESLintPRs, getCodelyzerRulesList } from './helpers';
import { CodelyzerRule, PRDetails, RuleDetails } from './interfaces';

const keyLegend = {
  done: ':white_check_mark:',
  'work in progress': ':construction:',
};

const staticElements = {
  rulesListKey: Object.keys(keyLegend).map(key => `${keyLegend[key]} = ${key}`),
  legendSpacerRow: '-----',
  ruleHeaderRow: ['Codelyzer rule', 'Status'],
  ruleSpacerRow: ['-----', ':-:'],
};

const findPR = (rule: CodelyzerRule, currentPrs: PRDetails[]) =>
  currentPrs.find(
    ({ title }) =>
      title.startsWith('feat(eslint-plugin)') && title.match(rule.ruleName),
  );

const buildRelativeLinksList = (rules: RuleDetails[]) =>
  rules.map(({ name }) => `[\`${name}\`]: https://codelyzer.com/rules/${name}`);

const buildPRLinksList = (prs: PRDetails[]) =>
  prs.map(({ url, number }) => `[\`PR${number}\`]: ${url}`);

const buildLegendTable = () => [
  '| |',
  `|${staticElements.legendSpacerRow}|`,
  ...staticElements.rulesListKey.map(key => `|${key}|`),
];

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

const buildRulesTables = (rules: RuleDetails[]) => {
  const ruleTypes = [...new Set(rules.map(({ type }) => type))].sort();

  const sections = ruleTypes.map(ruleType =>
    [
      `#### ${ruleType.charAt(0).toUpperCase()}${ruleType.slice(1)}`,
      '',
      staticElements.ruleHeaderRow.join('|'),
      staticElements.ruleSpacerRow.join('|'),
      ...ruleList(rules.filter(rule => rule.type === ruleType)),
      '',
    ].join('\n'),
  );

  return sections;
};

const updateRulesList = (rules: RuleDetails[], markdown: string): string => {
  const listBeginMarker = `<!-- begin rule list -->`;
  const listEndMarker = `<!-- end rule list -->`;

  const listStartIndex = markdown.indexOf(listBeginMarker);
  const listEndIndex = markdown.indexOf(listEndMarker);

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error(`cannot find start or end of rules list`);
  }

  return [
    markdown.substring(0, listStartIndex - 1),
    listBeginMarker,
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
      rules.map(rule => rule.pr).filter(pr => pr !== undefined),
    ),
    markdown.substring(listEndIndex),
  ].join('\n');
};

/**
 * Generates a Rules List in the following format:
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
 */
const updateReadme = async () => {
  const codelyzerRules = await getCodelyzerRulesList();
  const currentPrs = await getAngularESLintPRs();
  const currentRules = src.rules;
  const ruleDetails = codelyzerRules.map(rule => ({
    name: rule.ruleName,
    type: rule.type,
    done: currentRules[rule.ruleName] !== undefined,
    pr: findPR(rule, currentPrs),
  }));

  const readmeFile = path.resolve(__dirname, '../../../README.md');
  let readme = fs.readFileSync(readmeFile, 'utf8');

  readme = updateRulesList(ruleDetails, readme);
  readme = prettier.format(readme, { parser: 'markdown' });

  fs.writeFileSync(readmeFile, readme, 'utf8');
};

updateReadme();
