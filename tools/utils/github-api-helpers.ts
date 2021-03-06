import https, { RequestOptions } from 'https';
import { CodelyzerRule, PRDetails } from './interfaces';

/**
 * Calls the github api for the specified path and returns a Promise for the json response.
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

  return new Promise<T>((resolve) => {
    https.get(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    });
  });
};

/**
 * Returns a list of rule names that are currently in progress.
 */
export const getAngularESLintPRs = async (): Promise<PRDetails[]> => {
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
 * Returns a list of `CodelyzerRule`s from the Codelyzer repository.
 */
export const getCodelyzerRulesList = async (): Promise<CodelyzerRule[]> => {
  const rulesJson = await callGithubApi<CodelyzerRule[]>({
    host: 'raw.githubusercontent.com',
    path: '/mgechev/codelyzer/master/docs/_data/rules.json',
  });

  return rulesJson;
};
