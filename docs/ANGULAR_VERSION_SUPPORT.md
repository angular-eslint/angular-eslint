# Angular/Angular CLI version support with @angular-eslint

## Current (v12 and later)

As per the main README, as of v12, we aligned the major version of `@angular-eslint` with Angular (and Angular CLI).

Therefore, as an example (because these versions may or may not exist yet when you read this):

- `@angular-eslint` packages at `12.x.x` and `@angular/cli@12.x.x` are compatible
- `@angular-eslint` packages at `13.x.x` and `@angular/cli@13.x.x` are compatible
- `@angular-eslint` packages at `14.x.x` and `@angular/cli@14.x.x` are compatible
- ...and so on...

> NOTE: the exact minor and patch versions of each library represented here by `x`'s do not need to match each other, just the first (major) number

## Prior to v12

In order to support the above major version alignment to make things MUCH simpler from now on, in `@angular-eslint` we jumped from major version `4` to `12` (i.e. major versions 5-11 do not exist). This makes the version alignment prior to v12 a little harder to follow by comparison, but the following section outlines what you should be using together if you cannot move to Angular v12 yet for whatever reason.

For `@angular-eslint` versions prior to v12 and greater than v2 (`>= 2 < 12`), we supported Angular CLI `11.2.0` up until, **but not including**, `12.0.0`. This is also captured by our integration-tests package.

For v1.x.x of these packages we supported Angular from `10.1.0` to `11.1.0`.

### Why does Angular support in v1.x.x start at Angular `10.1.0`?

Angular `10.1.0` is significant because at version `10.0.0` the Angular Team switched to using project references and a `tsconfig.base.json` at the root of the project. This ultimately was deemed to be unsuccessful and in `10.1.0` they switched back to the original `tsconfig.json` without project references. Because angular-eslint and typescript-eslint care about your underlying TypeScript config, it is important that you are on the updated version which does _not_ use project references.

The schematic will error if you try and run it when you still have a `tsconfig.base.json`.

As usual, the Angular Team provided an automatic migration for these changes as part of `ng update`, so for most people this change wasn't an issue. If you updated manually (which is highly discouraged), then it is possible you did not apply this critical change and will therefore run into the error with the schematic.

We recommend going back an running the automated migrations from `ng update`, or fixing things up manually as a last resort.
