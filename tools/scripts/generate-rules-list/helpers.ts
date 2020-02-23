import https, { RequestOptions } from 'https';
import { CodelyzerRule, GithubPullRequest, PRDetails } from './interfaces';

/**
 * @description
 * Calls the github api for the specified path and returns a Promise for the json response.
 *
 * @param path The api path to call
 */
const callGithubApi = <T>(optionOverrides: RequestOptions) => {
  const options = {
    protocol: 'https:',
    host: 'api.github.com',
    headers: {
      'User-Agent': 'angular-eslint',
    },
    ...optionOverrides,
  };

  return new Promise<T>(resolve => {
    https.get(options, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    });
  });
};

/**
 * @description
 * Returns a list of rule names that are currently in progress.
 */
export const getAngularESLintPRs = async () => {
  const prsJson = await callGithubApi<GithubPullRequest[]>({
    path: '/repos/angular-eslint/angular-eslint/pulls?state=open',
  });

  return prsJson.map<PRDetails>(({ title, state, url, number }) => ({
    title,
    state,
    url,
    number,
  }));
};

export const getCodelyzerRulesList = async () => {
  const rulesJson = await callGithubApi<CodelyzerRule[]>({
    host: 'raw.githubusercontent.com',
    path: '/mgechev/codelyzer/master/docs/_data/rules.json',
  });

  return rulesJson;
};
