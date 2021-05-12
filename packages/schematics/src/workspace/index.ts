import type { Rule } from '@angular-devkit/schematics';

export default function (): Rule {
  return () => {
    throw new Error(
      '\n' +
        `
Error: Using \`--collection=@angular-eslint/schematics\` is no longer supported.

In previous versions of @angular-eslint we attempted to let developers create Angular CLI workspaces and add ESLint in a single command by providing the \`--collection\` flag to \`ng new\`.

This worked for simple scenarios but it was not possible to support all the options of \`ng new\` this way and it was harder to reason about in many cases.

Instead, simply:
- Run \`ng new\` (without \`--collection\`) and create your Angular CLI workspace with whatever options you prefer.
- Change directory to your new workspace and run \`ng add @angular-eslint/schematics\` to add all relevant ESLint packages.
- Run \`ng g @angular-eslint/schematics:convert-tslint-to-eslint --remove-tslint-if-no-more-tslint-targets --ignore-existing-tslint-config\` to automatically convert your new project from TSLint to ESLint.
`.trim(),
    );
  };
}
