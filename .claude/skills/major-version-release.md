# Major Version Release Preparation

This skill prepares the angular-eslint repository for a major version release by creating a new branch, updating dependencies, running validation checks, and creating a draft PR with milestone issues.

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

### 2. Create Release Branch

- Ensure we're on the latest main branch: `git checkout main && git pull origin main`
- Create new branch: `git checkout -b next-major-release/v${NEXT_MAJOR_VERSION}`

### 3. Update Angular Dependencies

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

### 6. Run Validation Commands

Execute the required commands from CLAUDE.md to check for breaking changes:

```bash
pnpm format-check # If fails: run `pnpm format` and commit result
pnpm nx sync:check # If fails: run `pnpm nx sync` and commit result
pnpm nx run-many -t check-rule-docs # If fails: run `pnpm nx run-many -t update-rule-docs` and commit result
pnpm nx run-many -t check-rule-lists # If fails: run `pnpm nx run-many -t update-rule-lists` and commit result
pnpm nx run-many -t check-rule-configs # If fails: run `pnpm nx run-many -t update-rule-configs` and commit result
pnpm nx run-many -t test --parallel 2 # Run all tests
pnpm nx run-many -t lint --parallel 2 # Run all linting
pnpm nx run-many -t typecheck --parallel 2 # Run all type checking
```

### 7. Update E2E Snapshots

- Run `pnpm update-e2e-snapshots-ci` to update e2e snapshots for the new version
- Commit only the snapshot changes (ignore any package.json diffs)

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

## Output

The skill should provide:

- Branch name created
- Summary of dependency updates made
- Results of validation commands (pass/fail status)
- Link to created draft PR
- List of milestone issues that need to be addressed

## Error Handling

- **If working tree is not clean, abort immediately with clear message**
- If dependency updates fail, provide specific error details
- If validation commands fail, indicate which ones and suggest next steps
- If milestone doesn't exist, note that manual issue review will be needed
- If PR creation fails, provide the formatted description for manual creation
