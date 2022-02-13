// @ts-check
const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  try {
    const token = core.getInput('github-token', { required: true });
    const commentBody = core.getInput('comment', { required: true });

    const context = github.context;
    const octokit = github.getOctokit(token, {
      previews: ['ant-man-preview', 'flash-preview'],
    });

    await octokit.rest.pulls.update({
      ...context.repo,
      pull_number: context.payload.pull_request.number,
      state: 'closed'
    });

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body: commentBody,
    });
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

main();
