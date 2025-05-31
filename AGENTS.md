# Guidelines for Codex

This repository uses Nx as the task runner and monorepo manager for building and testing Angular ESLint packages.

NOTE: This repo uses Nx Cloud for the distributed task execution, AI integration, and remote caching benefits. It requires internet access, which is not available in the Codex environment, so **all nx commands must be executed with `NX_NO_CLOUD=true`**.

## Package Manager

This project uses **pnpm** (version 10) as the package manager. Always use `pnpm` commands instead of `npm` or `yarn`.

## Required checks

When modifying rule implementations or documentation, run the following commands and ensure they pass (noting the comments that explain what to do if any of these checks fail):

```bash
pnpm format-check # run pnpm nx format and commit the result if this check fails
pnpm nx sync:check # run pnpm nx sync and commit the result if this check fails
NX_NO_CLOUD=true pnpm nx run-many -t check-rule-docs # run NX_NO_CLOUD=true pnpm nx run-many -t update-rule-docs and commit the result if this check fails
NX_NO_CLOUD=true pnpm nx run-many -t check-rule-lists # run NX_NO_CLOUD=true pnpm nx run-many -t update-rule-lists and commit the result if this check fails
NX_NO_CLOUD=true pnpm nx run-many -t check-rule-configs # run NX_NO_CLOUD=true pnpm nx run-many -t update-rule-configs and commit the result if this check fails
```

When working on an individual rule, the preferred way to run tests is to target the specific spec file. For example, to run tests for the `prefer-standalone` rule within the `eslint-plugin` project, run:

```bash
NX_NO_CLOUD=true pnpm nx test eslint-plugin packages/eslint-plugin/tests/rules/prefer-standalone/spec.ts --runInBand
```

Once rule specific tests have passed, run commands for all projects:

Use `pnpm nx run-many -t test --parallel 2` to run all tests across all packages.
Use `pnpm nx run-many -t lint --parallel 2` to run all linting across all packages.
Use `pnpm nx run-many -t typecheck --parallel 2` to run TypeScript type checking across all packages.

If there are memory issues with jest tests, try passing `--runInBand` to the test command andor changing the number of parallel tests to 1.

If you are updating e2e tests, you may need to update the snapshots. Run `pnpm update-e2e-snapshots` to update the snapshots and commit the resulting snapshot changes. NOTHING ELSE. There will be a diff on package.json files etc when doing this, but ONLY commit the snapshot changes.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and PR titles.

- When a change affects a single project, include its name as the scope: `feat(eslint-plugin-template): add new rule`.
- When multiple projects are affected, omit the scope: `fix: correct lint configuration`.

By convention, if only updating a single rule within a single project, for example the `alt-text` rule within the `eslint-plugin-template` project, the commit message should be `fix(eslint-plugin-template): [alt-text] description of the change`.

For any changes that only update tests, use `test` or `chore` as the commit/PR type, do not use `fix` or `feat`.
