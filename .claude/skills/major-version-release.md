# Major Version Release Preparation

This skill prepares the angular-eslint repository for a major version release by creating a new branch, updating dependencies, running validation checks, and creating a draft PR with milestone issues.

**Note**: This is a preparatory skill that may not complete all steps successfully. Critical failures will stop execution to prevent incomplete releases.

## Steps

### 1. Check Working Tree Status

- Run `git status` to check if the working tree is clean
- **If there are any uncommitted changes or untracked files, abort the skill immediately**
- Display message: "Working tree is not clean. Please commit or stash changes before running major version release."

### 2. Determine Next Major Version

- Read `pnpm-workspace.yaml`
- Find the `@angular/compiler` dependency version (currently `20.3.11`)
- Extract the major version number and increment by 1 (e.g., 20 → 21)
- Store as `NEXT_MAJOR_VERSION`

### 3. Create Release Branch

- Ensure we're on the latest main branch: `git checkout main && git pull origin main`
- Create new branch: `git checkout -b next-major-release/v${NEXT_MAJOR_VERSION}`

### 4. Update Angular Dependencies

Update dependencies in `pnpm-workspace.yaml`:

#### Exact Version Updates (to latest of next major version):

- `@angular/cli`: Update to exact latest version of next major
- `@angular/compiler`: Update to exact latest version of next major
- `@schematics/angular`: Update to exact latest version of next major

#### Range Updates (in `other-runtime-dependencies` catalog):

- `@angular-devkit/architect`: Update range from `>= 0.X000.0 < 0.X100.0` to `>= 0.(X+1)000.0 < 0.(X+2)00.0`
- `@angular-devkit/core`: Update range from `>= X.0.0 < (X+1).0.0` to `>= (X+1).0.0 < (X+2).0.0`
- `@angular-devkit/schematics`: Update range from `>= X.0.0 < (X+1).0.0` to `>= (X+1).0.0 < (X+2).0.0`

### 5. Install Updated Dependencies

- Run `pnpm install` to install updated dependencies
- Commit dependency changes immediately after successful install with clean commit message (no Claude metadata)

### 6. Run Validation Commands

Execute the required commands from CLAUDE.md to check for breaking changes:

```bash
pnpm format-check # If fails: run `pnpm format` and commit result
pnpm nx sync:check # If fails: run `pnpm nx sync` and commit result
pnpm nx run-many -t check-rule-docs # If fails: run `pnpm nx run-many -t update-rule-docs` and commit result
pnpm nx run-many -t check-rule-lists # If fails: run `pnpm nx run-many -t update-rule-lists` and commit result
pnpm nx run-many -t check-rule-configs # If fails: run `pnpm nx run-many -t update-rule-configs` and commit result
pnpm nx run-many -t test --parallel 2 # Run all tests
pnpm nx run-many -t lint --parallel 2 # Run all linting (warnings acceptable)
pnpm nx run-many -t typecheck --parallel 2 # Run all type checking
```

**CRITICAL**: If any of the following commands fail, STOP the skill execution immediately:

- Tests (`pnpm nx run-many -t test --parallel 2`)
- Type checking (`pnpm nx run-many -t typecheck --parallel 2`)

Only proceed if tests pass and type checking succeeds. Linting warnings are acceptable.

### 7. Update E2E Snapshots

- Attempt to run `npx nx run e2e:e2e-local --configuration updateSnapshot` to update e2e snapshots. NOTE: `npx` should be used here, not `pnpm`, so that the verdaccio local registry auth works correctly
- **If the E2E commands fail, STOP the skill execution immediately** and feed back to the user. Do not revert files.
- If snapshots are updated successfully, commit only the actual snapshot file changes
- Reset any package.json changes with `git restore packages/*/package.json`

### 8. Fetch Milestone Issues

- Use GitHub API to find milestone matching `v${NEXT_MAJOR_VERSION}`
- Retrieve all open issues associated with that milestone
- Format issues as a checklist for the PR description

### 9. Create Draft Pull Request

- Push the branch: `git push origin next-major-release/v${NEXT_MAJOR_VERSION}`
- Create a DRAFT pull request from `next-major-release/v${NEXT_MAJOR_VERSION}` to `main`
- Title: `feat!: angular-eslint v${NEXT_MAJOR_VERSION}`
- Description template:

  ```markdown
  # Major Version Release: v${NEXT_MAJOR_VERSION}

  This PR prepares the repository for the next major version release.

  ## Changes Made

  - ✅ Updated @angular dependencies to v${NEXT_MAJOR_VERSION}
  - ✅ Updated dependency ranges for @angular-devkit packages
  - ✅ Ran validation commands and updated generated files
  - ✅ Updated E2E snapshots

  ## Milestone Issues

  The following issues from the v${NEXT_MAJOR_VERSION} milestone need to be addressed:

  ${MILESTONE_ISSUES_CHECKLIST}

  ## Next Steps

  - [ ] Address any remaining test failures
  - [ ] Complete milestone issues listed above
  ```

## Commit Message Requirements

**IMPORTANT**: All commits must be clean conventional commits without any Claude Code metadata:

- ✅ Good: `feat!: update Angular dependencies to v21`
- ❌ Bad: Any commit with "🤖 Generated with [Claude Code]" or "Co-Authored-By: Claude"

## Failure Handling

**STOP EXECUTION IMMEDIATELY if any of these conditions occur:**

1. **Working tree is not clean** - abort with message: "Working tree is not clean. Please commit or stash changes before running major version release."
2. **Tests fail** - abort with message: "Tests failed. Cannot proceed with major version release until all tests pass."
3. **Type checking fails** - abort with message: "Type checking failed. Cannot proceed with major version release until type errors are resolved."
4. **E2E snapshot updates fail** - abort with message: "E2E snapshot updates failed. Cannot proceed with major version release until snapshots are updated."

## Output

The skill should provide:

- Branch name created
- Summary of dependency updates made
- Results of validation commands (pass/fail/warning status)
- Any failures encountered and why execution was stopped (if applicable)
- E2E snapshot update status
- Link to created draft PR (if successful)
- List of milestone issues that need to be addressed (if milestone exists)

## Error Handling

- **If critical validations fail, abort immediately with clear message**
- If dependency updates fail, provide specific error details and abort
- If format/sync checks fail, attempt to auto-fix and commit
- If milestone doesn't exist, note that manual issue review will be needed
- If PR creation fails, provide the formatted description for manual creation
- If E2E updates fail, abort execution immediately
