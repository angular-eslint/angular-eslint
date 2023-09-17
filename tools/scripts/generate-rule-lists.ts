import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';
import eslintPluginTemplate from '../../packages/eslint-plugin-template/src';
import eslintPlugin from '../../packages/eslint-plugin/src';

type RuleModule =
  | (typeof eslintPlugin.rules)[keyof typeof eslintPlugin.rules]
  | (typeof eslintPluginTemplate.rules)[keyof typeof eslintPluginTemplate.rules];
type RuleItem = [string, RuleModule];
type RulesList = RuleItem[];
type Column = { header: string; dataFn: DataFn };
type KeyOfEmojiKey = keyof typeof emojiKey;

interface Plugin {
  name: string;
  filePath: string;
  rules: RulesList;
  withAccessibility: boolean;
}

const emojiKey = {
  recommended: { emoji: ':white_check_mark:', desc: 'recommended' },
  fixable: { emoji: ':wrench:', desc: 'fixable' },
  hasSuggestions: { emoji: ':bulb:', desc: 'has suggestions' },
  accessibility: {
    emoji: ':accessibility:',
    desc: 'included in accessibility preset',
  },
} as const satisfies Record<string, { emoji: string; desc: string }>;

const emojiWithDesc = (key: KeyOfEmojiKey): string => emojiKey[key].emoji;

const keyListItem = (key: KeyOfEmojiKey): string =>
  `* ${emojiWithDesc(key)} = ${emojiKey[key].desc}`;

const returnEmojiIfTrue = (key: KeyOfEmojiKey, value: boolean): string =>
  value ? emojiWithDesc(key) : '';

const createRuleLink = ([name, rule]: RuleItem, plugin: Plugin): string => {
  const fullRuleName = plugin.name ? `${name}` : name;
  return `[\`${fullRuleName}\`](${rule?.meta?.docs?.url})`;
};

const ruleKey = (withAccessibility: boolean): string =>
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

const buildRow = (
  ruleItem: RuleItem,
  plugin: Plugin,
  columnsSet: Column[],
): string => columnsSet.map((col) => col.dataFn(ruleItem, plugin)).join(' | ');

const buildRulesTable = (rules: RulesList = [], plugin: Plugin): string => {
  const columnSet = rules[0][1].meta.deprecated
    ? columnsDeprecated
    : plugin.withAccessibility
    ? columns.concat(accessibilityColumn)
    : columns;
  return [
    `| ${columnSet.map((col) => col.header).join(' | ')} |`,
    `| ${columnSet.map(() => '---').join(' | ')} |`,
    ...rules.map(
      (item: RuleItem) => `| ${buildRow(item, plugin, columnSet)} |`,
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
  rules: RulesList,
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

  const content: string = rules.length
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
): RuleItem[] => rules.filter(([, rule]) => rule.meta.type === type);

const updateFile = async (plugin: Plugin): Promise<void> => {
  const filePath = resolve(__dirname, plugin.filePath);
  const oldReadme = readFileSync(filePath, 'utf8');
  let readme = oldReadme;

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

  readme = await format(readme, {
    ...(await resolveConfig(filePath)),
    parser: 'markdown',
  });

  if (readme === oldReadme) {
    console.log(`\n✅ Rule list of ${plugin.name} is already up-to-date.`);
  } else {
    try {
      await writeFile(filePath, readme);
      console.log(`\n✨ Updated rule list for ${plugin.name}!`);
    } catch (err) {
      console.error(
        `❌ Error while writing updated readme file for ${plugin.name}`,
      );
      console.error(err);
    }
  }
};

const getRuleEntries = (rules: Record<string, RuleModule>): RulesList =>
  Object.entries(rules).sort((a, b) => a[0].localeCompare(b[0]));

(async function main() {
  const pluginName = process.argv[2];
  if (pluginName === 'eslint-plugin') {
    const pluginInfo: Plugin = {
      rules: getRuleEntries(eslintPlugin.rules),
      name: '@angular-eslint',
      filePath: '../../packages/eslint-plugin/README.md',
      withAccessibility: false,
    };
    await updateFile(pluginInfo);
  } else if (pluginName === 'eslint-plugin-template') {
    const pluginInfo: Plugin = {
      rules: getRuleEntries(eslintPluginTemplate.rules),
      name: '@angular-eslint/template',
      filePath: '../../packages/eslint-plugin-template/README.md',
      withAccessibility: true,
    };
    await updateFile(pluginInfo);
  } else {
    console.error(
      `\nError: the first argument to the script must be "eslint-plugin-template" or "eslint-plugin"`,
    );
    process.exit(1);
  }
})();
