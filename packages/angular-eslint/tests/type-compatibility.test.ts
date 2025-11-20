/**
 * This test file exists purely to be type-checked in CI to ensure that angular-eslint plugins and parsers are compatible with both:
 * 1. ESLint's defineConfig function (uses ESLint.Plugin and Linter.ParserModule types)
 * 2. typescript-eslint's config function (uses TSESLint.FlatConfig.Plugin and TSESLint.FlatConfig.Parser types)
 */

import { defineConfig } from 'eslint/config';
import { config } from 'typescript-eslint';

import angular from '../src/index';

/**
 * Test 1: Verify compatibility with ESLint's defineConfig
 */
defineConfig([
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular.tsPlugin,
    },
    rules: {
      '@angular-eslint/component-class-suffix': 'error',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angular.templatePlugin,
    },
    languageOptions: {
      parser: angular.templateParser,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
    },
  },
]);

/**
 * Test 2: Verify compatibility with typescript-eslint's config function
 */
config(
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular.tsPlugin,
    },
    rules: {
      '@angular-eslint/component-class-suffix': 'error',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angular.templatePlugin,
    },
    languageOptions: {
      parser: angular.templateParser,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
    },
  },
);
