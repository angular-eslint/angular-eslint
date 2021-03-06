import {
  readExistingReadmeFile,
  regenerateReadmeRulesList,
} from '../utils/generate-rules-list';

/**
 * Determines whether or not the README needs updating
 */
(async function checkReadmeRulesList() {
  try {
    const existingReadme = readExistingReadmeFile();
    const updatedReadme = await regenerateReadmeRulesList();

    if (existingReadme !== updatedReadme) {
      throw new Error(
        'Please update the README before pushing. You can run `yarn update-readme-rules-list`',
      );
    }
  } catch (err) {
    console.error(`\x1b[31m%s\x1b[0m`, err.message);
    process.exit(1);
  }
})();
