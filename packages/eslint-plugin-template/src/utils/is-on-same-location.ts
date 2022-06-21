import type {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
} from '@angular-eslint/bundled-angular-compiler';

export function isOnSameLocation(
  input: TmplAstBoundAttribute,
  output: TmplAstBoundEvent,
) {
  return (
    input.sourceSpan.start === output.sourceSpan.start &&
    input.sourceSpan.end === output.sourceSpan.end
  );
}
