# Agent instructions

Read `CLAUDE.md` before making changes for repository workflows, validation commands, and commit conventions. Use the Node.js and pnpm versions declared in `package.json`.

## Rule test layout

- Put rule test fixtures in `packages/<project>/tests/rules/<rule-name>/cases.ts`, in the exported `valid` or `invalid` array.
- Keep `spec.ts` focused on setting up `RuleTester` and passing the imported `valid` and `invalid` arrays to `ruleTester.run()`.
- Never add rule test fixtures directly to `spec.ts`, including by spreading an imported array and appending cases inline. Adding regression coverage to an existing rule should normally only change `cases.ts`.
- Follow the existing fixture types and helpers in `cases.ts`. For annotated invalid cases, use `convertAnnotatedSourceToFailureCase()` and the shared typed `messageId` constant when present.
- Preserve exact expected autofix output, including whitespace, in `annotatedOutput`.
- Rule documentation is generated from `cases.ts`. After changing cases, run `pnpm nx run <project>:update-rule-docs` and commit any generated documentation changes; do not edit rule documentation manually.
- Before committing, review the diff and confirm that new cases are in `cases.ts` and that `spec.ts` has no unnecessary changes.
