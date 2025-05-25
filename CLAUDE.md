# Guidelines for Claude Code

This repository uses Nx as the task runner and monorepo manager for building and testing Angular ESLint packages.

## Package Manager

This project uses **pnpm** (version 10) as the package manager. Always use `pnpm` commands instead of `npm` or `yarn`.

## Required checks

When modifying rule implementations or documentation, run the following commands and ensure they pass (noting the comments that explain what to do if any of these checks fail):

```bash
pnpm format-check # run pnpm format and commit the result if this check fails
pnpm nx sync:check # run pnpm nx sync and commit the result if this check fails
pnpm nx run-many -t check-rule-docs # run pnpm nx run-many -t update-rule-docs and commit the result if this check fails
pnpm nx run-many -t check-rule-lists # run pnpm nx run-many -t update-rule-lists and commit the result if this check fails
pnpm nx run-many -t check-rule-configs # run pnpm nx run-many -t update-rule-configs and commit the result if this check fails
```

Additionally, run tests and lints for any affected project. For example, changes to `eslint-plugin-template` require:

```bash
pnpm nx test eslint-plugin-template
pnpm nx lint eslint-plugin-template
```

Use `pnpm nx run-many -t test` to run all tests across all packages.
Use `pnpm nx run-many -t lint` to run all linting across all packages.
Use `pnpm nx run-many -t typecheck` to run TypeScript type checking across all packages.

If there are memory issues with jest tests, try passing `--runInBand` to the test command.

If you are updating e2e tests, you may need to update the snapshots. Run `pnpm update-e2e-snapshots` to update the snapshots and commit the resulting snapshot changes. NOTHING ELSE. There will be a diff on package.json files etc when doing this, but ONLY commit the snapshot changes.

## Project Structure

This is a monorepo with the following main packages in `/packages/`:

- **angular-eslint**: Main package that provides configurations
- **eslint-plugin**: Core ESLint rules for Angular TypeScript code
- **eslint-plugin-template**: ESLint rules for Angular HTML templates
- **builder**: Angular CLI builder for running ESLint
- **schematics**: Angular schematics for adding ESLint to projects
- **template-parser**: Parser for Angular templates
- **test-utils**: Testing utilities
- **utils**: Shared utility functions
- **bundled-angular-compiler**: Bundled Angular compiler
- **nx-plugin**: Nx plugin for the local Angular ESLint monorepo, not published to npm

## Code Conventions

### TypeScript Configuration

- **Strict TypeScript**: Uses strict mode with additional strict flags like `noImplicitReturns`, `noUnusedLocals`, `noFallthroughCasesInSwitch`
- **Target**: ES2022 with Node.js module resolution
- **Module system**: NodeNext for modern Node.js compatibility

### ESLint Configuration

- Uses **flat config** format (eslint.config.js)
- Nx ESLint plugin for monorepo management
- JSONC parser for JSON files
- Enforces module boundaries between packages

### File Naming and Structure

- **Test files**: Use `.spec.ts` suffix and live in `tests/` directories
- **Rule files**: Individual TypeScript files in `src/rules/`
- **Config files**: JSON files in `src/configs/`
- **Documentation**: Markdown files in `docs/rules/` matching rule names. NOTE: THESE ARE AUTO-GENERATED, DO NOT EDIT THEM MANUALLY.
- **Test cases**: Organized in `tests/rules/{rule-name}/cases.ts` and `tests/rules/{rule-name}/spec.ts`

### Rule Development Patterns

When creating or modifying ESLint rules:

1. Rules are implemented in TypeScript using the `@typescript-eslint/utils` package
2. Each rule has its own file in `src/rules/`
3. Rule documentation is auto-generated and lives in `docs/rules/`
4. Test cases follow a pattern with `cases.ts` and `spec.ts` files
5. Rules use a utility function `createESLintRule()` for consistent structure

### Testing Conventions

- **Jest**: Primary testing framework
- **Rule testing**: Uses `@typescript-eslint/rule-tester` for ESLint rule testing
- **Snapshot testing**: Used for E2E tests and some rule outputs
- **Test organization**: Tests mirror the source structure in separate `tests/` directories

### Build and Release

- **Build**: Uses Nx with TypeScript compilation
- **Targets**: Multiple build targets (`build`, `compile`) with dependency management
- **Release**: Conventional Commits with automated changelogs
- **Versioning**: Uses Nx release management with GitHub integration

Claude should NEVER run versioning or publishing commands.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and PR titles.

- When a change affects a single project, include its name as the scope: `feat(eslint-plugin-template): add new rule`.
- When multiple projects are affected, omit the scope: `fix: correct lint configuration`.

By convention, if only updating a single rule within a single project, for example the `alt-text` rule within the `eslint-plugin-template` project, the commit message should be `fix(eslint-plugin-template): [alt-text] description of the change`.

For any changes that only update tests, use `test` or `chore` as the commit/PR type, do not use `fix` or `feat`.

## Development Tools

- **Node.js**: Managed by Volta, always check the `package.json` file for the correct version.
- **Husky**: Git hooks for pre-commit and pre-push checks
- **Lint-staged**: Run linters on staged files

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run E2E tests
pnpm e2e

# Run E2E tests and update snapshots
pnpm update-e2e-snapshots

# Format code
pnpm format

# Check formatting
pnpm format-check

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Update rule documentation
pnpm update-rule-docs

# Update rule lists in READMEs
pnpm update-rule-lists

# Update rule configurations
pnpm update-rule-configs
```
