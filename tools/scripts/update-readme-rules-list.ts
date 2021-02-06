import {
  updateReadmeFile,
  regenerateReadmeRulesList,
} from '../utils/generate-rules-list';

/**
 * Updates the README.md file with the regenerated Rules List
 */
(async function updateReadmeRulesList() {
  try {
    const updatedReadme = await regenerateReadmeRulesList();
    updateReadmeFile(updatedReadme);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
