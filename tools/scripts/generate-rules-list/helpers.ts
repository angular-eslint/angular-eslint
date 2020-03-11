import https, { RequestOptions } from 'https';
import { CodelyzerRule, PRDetails } from './interfaces';

/**
 * @description
 * Calls the github api for the specified path and returns a Promise for the json response.
 *
 * @param optionOverrides RequestOptions for the Request.
 * @returns an object representing the json returned by the endpoint.
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
 *
 * @async
 * @returns an Array of PRDetails.
 */
export const getAngularESLintPRs = async () => {
  const prsJson = await callGithubApi<PRDetails[]>({
    path: '/repos/angular-eslint/angular-eslint/pulls?state=open',
  });

  return prsJson.map<PRDetails>(({ title, state, url, number }) => ({
    title,
    state,
    url,
    number,
  }));
};

/**
 * @description
 * Returns a list of CodelyzerRule from the Codelyzer repository.
 *
 * @async
 * @returns an Array of CodelyzerRule.
 */
export const getCodelyzerRulesList = async () => {
  const rulesJson = await callGithubApi<CodelyzerRule[]>({
    host: 'raw.githubusercontent.com',
    path: '/mgechev/codelyzer/master/docs/_data/rules.json',
  });

  return rulesJson;
};
