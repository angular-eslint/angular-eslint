import type { JsonObject } from '@angular-devkit/core';

export interface Schema extends JsonObject {
  format: Formatter;
  lintFilePatterns: string[];
  force: boolean;
  silent: boolean;
  fix: boolean;
  cache: boolean;
  cacheLocation: string | null;
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
