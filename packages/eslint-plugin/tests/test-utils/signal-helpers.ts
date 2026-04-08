export function addSignalImports(code: string) {
  // Exclude the types from the generated docs because they
  // are standard Angular types and only need to be defined
  // so that the type symbols in the tests are correct.
  /* v8 ignore if -- @preserve */
  if (process.env.GENERATING_RULE_DOCS === '1') {
    return code;
  }

  // The code we have been given should have already been parsed and the line
  // numbers of any expected errors extracted. That means that when we insert
  // the import statement, we cannot cause the line numbers or column numbers
  // of any of the code to change. The code should start with a new line, so we
  // can put the import statement at the very start without a trailing new line
  // and that won't affect the line or column numbers of any of the given code.
  return (
    'import { effect, InputSignal, InputSignalWithTransform, ModelSignal, signal, Signal, WritableSignal } from "@angular/core";' +
    code
  );
}
