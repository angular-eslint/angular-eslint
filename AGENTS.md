# Guidelines for Codex

This repository uses Nx as the task runner. Nx Cloud requires internet access, which is not available in the Codex environment, so **all nx commands must be executed with `NX_NO_CLOUD=true`**.

## Required checks

When modifying rule implementations or documentation, run the following commands and ensure they pass:

```bash
pnpm format-check
NX_NO_CLOUD=true pnpm nx sync:check
NX_NO_CLOUD=true pnpm nx run-many -t check-rule-docs
NX_NO_CLOUD=true pnpm nx run-many -t check-rule-lists
NX_NO_CLOUD=true pnpm nx run-many -t check-rule-configs
```

Additionally, run tests and lints for any affected project. For example, changes to `eslint-plugin-template` require:

```bash
NX_NO_CLOUD=true pnpm nx test eslint-plugin-template
NX_NO_CLOUD=true pnpm nx lint eslint-plugin-template
```

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and PR titles.

- When a change affects a single project, include its name as the scope: `feat(eslint-plugin-template): add new rule`.
- When multiple projects are affected, omit the scope: `fix: correct lint configuration`.
