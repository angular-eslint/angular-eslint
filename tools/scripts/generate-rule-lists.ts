import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { format } from 'prettier';

import eslintPlugin from '../../packages/eslint-plugin/src';
import eslintPluginTemplate from '../../packages/eslint-plugin-template/src';

type RuleModule =
  | (typeof eslintPlugin.rules)[keyof typeof eslintPlugin.rules]
  | (typeof eslintPluginTemplate.rules)[keyof typeof eslintPluginTemplate.rules];
type RuleItem = [string, RuleModule];
type RulesList = RuleItem[];
type Column = { header: string; dataFn: DataFn };

interface Plugin {
  name: string;
  file: string;
  rules: RulesList;
  withAccessibility: boolean;
}

/** Check that plugin name is correct before going forward */

const plugin = process.argv[2];

if (plugin !== 'eslint-plugin-template' && plugin !== 'eslint-plugin') {
  console.error(
    `\nError: the first argument to the script must be "eslint-plugin-template" or "eslint-plugin"`,
  );
  process.exit(1);
}

const emojiKey = {
  recommended: { emoji: ':white_check_mark:', desc: 'recommended' },
  fixable: { emoji: ':wrench:', desc: 'fixable' },
  hasSuggestions: { emoji: ':bulb:', desc: 'has suggestions' },
  accessibility: {
    emoji: ':accessibility:',
    desc: 'included in accessibility preset',
  },
} as const;

const emojiWithDesc = (key: keyof typeof emojiKey): string =>
  emojiKey[key].emoji;

const keyListItem = (key: keyof typeof emojiKey): string =>
  `* ${emojiWithDesc(key)} = ${emojiKey[key].desc}`;

const returnEmojiIfTrue = (
  key: keyof typeof emojiKey,
  value: boolean,
): string => (value ? emojiWithDesc(key) : '');

const createRuleLink = ([name, rule]: RuleItem, plugin: Plugin): string => {
  const fullRuleName = plugin?.name ? `${name}` : name;
  return `[\`${fullRuleName}\`](${rule?.meta?.docs?.url})`;
};

const ruleKey = (withAccessibility: boolean) =>
  [
    '**Key**',
    '',
    keyListItem('recommended'),
    keyListItem('fixable'),
    keyListItem('hasSuggestions'),
    withAccessibility ? keyListItem('accessibility') : undefined,
  ]
    .filter(Boolean)
    .join('\n');

type DataFn = (ruleItem: RuleItem, plugin: Plugin) => string;

const columns: Column[] = [
  {
    header: 'Rule',
    dataFn: (ruleItem: RuleItem, plugin: Plugin) =>
      createRuleLink(ruleItem, plugin),
  },
  {
    header: 'Description',
    dataFn: ([, rule]: RuleItem) =>
      rule.meta.docs?.description.replace(/\s{2,}/, ' ') || '',
  },
  {
    header: emojiWithDesc('recommended'),
    dataFn: ([, rule]: RuleItem) =>
      returnEmojiIfTrue('recommended', !!rule.meta.docs?.recommended),
  },
  {
    header: emojiWithDesc('fixable'),
    dataFn: ([, rule]: RuleItem) =>
      returnEmojiIfTrue('fixable', !!rule.meta.fixable),
  },
  {
    header: emojiWithDesc('hasSuggestions'),
    dataFn: ([, rule]: RuleItem) =>
      returnEmojiIfTrue('hasSuggestions', !!rule.meta.hasSuggestions),
  },
];

const accessibilityColumn: Column = {
  header: emojiWithDesc('accessibility'),
  dataFn: ([, rule]: RuleItem) =>
    returnEmojiIfTrue(
      'accessibility',
      !!rule.meta.docs?.description.startsWith('[Accessibility]'),
    ),
};

const columnsDeprecated: Column[] = [
  {
    header: 'Rule',
    dataFn: (ruleItem: RuleItem, plugin: Plugin) =>
      createRuleLink(ruleItem, plugin),
  },
  {
    header: 'Replaced by',
    dataFn: ([name, rule]: RuleItem, plugin: Plugin) =>
      (rule.meta.replacedBy || [])
        .map((replacer) =>
          createRuleLink([name, rule], plugin).replace(name, replacer),
        )
        .join(', '),
  },
];

const buildRow = (ruleItem: RuleItem, plugin: Plugin, columnsSet: Column[]) =>
  columnsSet.map((col) => col.dataFn(ruleItem, plugin)).join(' | ');

const buildRulesTable = (rules: RulesList = [], plugin: Plugin): string => {
  const columnSet = rules[0][1].meta.deprecated
    ? columnsDeprecated
    : plugin.withAccessibility
    ? columns.concat(accessibilityColumn)
    : columns;
  return [
    '| ' + columnSet.map((col) => col.header).join(' | ') + ' |',
    '| ' + columnSet.map(() => '---').join(' | ') + ' |',
    ...rules.map(
      (item: RuleItem) => '| ' + buildRow(item, plugin, columnSet) + ' |',
    ),
  ].join('\n');
};

const buildRulesSection = (
  categoryName: string,
  rules: RulesList = [],
  plugin: Plugin,
): string =>
  [
    '',
    `### ${categoryName}`,
    '',
    rules[0][1].meta.deprecated ? '' : ruleKey(plugin.withAccessibility),
    '',
    '<!-- prettier-ignore-start -->',
    buildRulesTable(rules, plugin),
    '<!-- prettier-ignore-end -->',
    '',
  ].join('\n');

const updateRulesList = (
  listName: string,
  listId: string,
  rules: RulesList = [],
  markdown: string,
  plugin: Plugin,
): string => {
  const listBeginMarker = `<!-- begin ${listId} rule list -->`;
  const listEndMarker = `<!-- end ${listId} rule list -->`;

  const listStartIndex = markdown.indexOf(listBeginMarker);
  const listEndIndex = markdown.indexOf(listEndMarker);

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error(`cannot find start or end of ${listName} list`);
  }

  const content: string = rules?.length
    ? buildRulesSection(listName, rules, plugin)
    : '';

  return [
    markdown.substring(0, listStartIndex - 1),
    listBeginMarker,
    '',
    content,
    markdown.substring(listEndIndex),
  ].join('\n');
};

const getRulesByType = (
  rules: RuleItem[],
  type: 'suggestion' | 'problem' | 'layout',
) => rules.filter(([, rule]) => rule.meta.type === type);

const updateFile = async (plugin: Plugin): Promise<void> => {
  const filePath = resolve(__dirname, plugin.file);
  let readme = readFileSync(filePath, 'utf8');

  const deprecated = plugin.rules.filter(([, rule]) => rule.meta.deprecated);
  const notDeprecated = plugin.rules.filter(
    ([, rule]) => !rule.meta.deprecated,
  );

  readme = updateRulesList(
    'Possible problems',
    'problems',
    getRulesByType(notDeprecated, 'problem'),
    readme,
    plugin,
  );
  readme = updateRulesList(
    'Suggestions',
    'suggestions',
    getRulesByType(notDeprecated, 'suggestion'),
    readme,
    plugin,
  );
  readme = updateRulesList(
    'Layout',
    'layout',
    getRulesByType(notDeprecated, 'layout'),
    readme,
    plugin,
  );
  readme = updateRulesList(
    'Deprecated',
    'deprecated',
    deprecated,
    readme,
    plugin,
  );

  readme = await format(readme, { parser: 'markdown' });

  writeFileSync(filePath, readme, 'utf8');
};

const getRuleEntries = (rules: Record<string, RuleModule>) =>
  Object.entries(rules).sort((a, b) => a[0].localeCompare(b[0]));

const pluginList: Plugin[] = [
  {
    rules: getRuleEntries(eslintPlugin.rules),
    name: '@angular-eslint',
    file: join(__dirname, '../../packages/eslint-plugin/README.md'),
    withAccessibility: false,
  },
  {
    rules: getRuleEntries(eslintPluginTemplate.rules),
    name: '@angular-eslint/template',
    file: join(__dirname, '../../packages/eslint-plugin-template/README.md'),
    withAccessibility: true,
  },
];

(function main() {
  if (plugin === 'eslint-plugin') {
    updateFile(pluginList[0]);
  } else if (plugin === 'eslint-plugin-template') {
    updateFile(pluginList[1]);
  }
})();
