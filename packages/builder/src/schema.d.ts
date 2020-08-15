export interface Schema {
  tsConfig: string | string[];
  format: Formatter;
  files: string[];
  force: boolean;
  silent: boolean;
  quiet: boolean;
  fix: boolean;
  cache: boolean;
  outputFile: string;
  cacheLocation: string;
  exclude: string[];
  eslintConfig?: string;
  ignorePath?: string;
}

type Formatter =
  | 'stylish'
  | 'compact'
  | 'codeframe'
  | 'unix'
  | 'visualstudio'
  | 'table'
  | 'checkstyle'
  | 'html'
  | 'jslint-xml'
  | 'json'
  | 'json-with-metadata'
  | 'junit'
  | 'tap';
