import type { Rule } from '@angular-devkit/schematics';

export default function (): Rule {
  return () => {
    throw new Error(
      '\n' +
        `
Error: The \`convert-tslint-to-eslint\` schematic is no longer supported.

Please see https://github.com/angular-eslint/angular-eslint/blob/main/docs/MIGRATING_FROM_TSLINT.md
`.trim(),
    );
  };
}
