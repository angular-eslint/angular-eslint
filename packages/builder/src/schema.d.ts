import type { JsonObject } from '@angular-devkit/core';

export interface Schema extends JsonObject {
  tsConfig: string | string[];
  format: Formatter;
  files: string[];
  force: boolean;
  silent: boolean;
  fix: boolean;
  cache: boolean;
  outputFile: string;
  cacheLocation: string;
  exclude: string[];
  eslintConfig: string | null;
  ignorePath: string | null;
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
