# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/angular-eslint/angular-eslint/compare/v2.0.2...v2.1.0) (2021-04-11)

### Bug Fixes

- **builder:** expose maxWarnings option ([#402](https://github.com/angular-eslint/angular-eslint/issues/402)) ([76f5ba4](https://github.com/angular-eslint/angular-eslint/commit/76f5ba42e37af19d6c2026b6268dd634507d1f7b))
- **eslint-plugin:** no-call-expression incorrect reports for conditionals ([#390](https://github.com/angular-eslint/angular-eslint/issues/390)) ([fa9cc73](https://github.com/angular-eslint/angular-eslint/commit/fa9cc7369446f3a7605554754ac57485bf1b1bfb))
- **eslint-plugin-template:** accessibility-elements-content not allowing some attributes/inputs ([#397](https://github.com/angular-eslint/angular-eslint/issues/397)) ([ffedaa2](https://github.com/angular-eslint/angular-eslint/commit/ffedaa24c449af2e5536b235e264180c9a970980))
- **eslint-plugin-template:** i18n ignoreTags not being ignored properly ([#387](https://github.com/angular-eslint/angular-eslint/issues/387)) ([985f6c2](https://github.com/angular-eslint/angular-eslint/commit/985f6c2e8e70e42223a14fc5bd053732817ff4d9))
- **eslint-plugin-template:** i18n reporting when a parent element already contains i18n id ([#398](https://github.com/angular-eslint/angular-eslint/issues/398)) ([c937a3f](https://github.com/angular-eslint/angular-eslint/commit/c937a3f1d364f74acdb2cc17e507820a784ffb8e))

### Features

- **eslint-plugin:** add rule sort-ngmodule-metadata-arrays ([#386](https://github.com/angular-eslint/angular-eslint/issues/386)) ([935afdd](https://github.com/angular-eslint/angular-eslint/commit/935afdda16970f879c3dc45d45b6f5ef7d898d97))
- **template-parser:** support eslint-disable comments in HTML templates ([#405](https://github.com/angular-eslint/angular-eslint/issues/405)) ([5dd9578](https://github.com/angular-eslint/angular-eslint/commit/5dd9578d7c212cdead04c2142b920af6f654f2de))

## [2.0.2](https://github.com/angular-eslint/angular-eslint/compare/v2.0.1...v2.0.2) (2021-03-16)

### Bug Fixes

- **builder:** printInfo should not be taken into account for report ([#376](https://github.com/angular-eslint/angular-eslint/issues/376)) ([d7c6aa4](https://github.com/angular-eslint/angular-eslint/commit/d7c6aa49132100de23bd101f36ffccf6a8b6414e))

## [2.0.1](https://github.com/angular-eslint/angular-eslint/compare/v2.0.0...v2.0.1) (2021-03-14)

### Bug Fixes

- **eslint-plugin-template:** conditional-complexity error from bundling ([#373](https://github.com/angular-eslint/angular-eslint/issues/373)) ([f466c01](https://github.com/angular-eslint/angular-eslint/commit/f466c0157f5ecefe6eae9aa726aaf08853c1894d))

# [2.0.0](https://github.com/angular-eslint/angular-eslint/compare/v1.2.0...v2.0.0) (2021-03-13)

We have provided automated migrations for you to move to v2.

All you need to do is first update to Angular and Angular CLI v11.2.0 or above (see https://update.angular.io for full instructions relating to Angular updates):

```sh
npx ng update @angular/cli @angular/core
```

And then run the update schematics for `@angular-eslint`:

```sh
npx ng update @angular-eslint/schematics
```

---

### Bug Fixes

- **template-parser:** add BindingPipe exp to VisitorKeys ([#337](https://github.com/angular-eslint/angular-eslint/issues/337)) ([#338](https://github.com/angular-eslint/angular-eslint/issues/338)) ([75c406f](https://github.com/angular-eslint/angular-eslint/commit/75c406f9f496740a694681916b8b4cd7b438d574))
- add docs url for both plugins ([#360](https://github.com/angular-eslint/angular-eslint/issues/360)) ([4c9b068](https://github.com/angular-eslint/angular-eslint/commit/4c9b068a13b2ff8e7d5ebc3730564658d7cdc5c6))

### Features

- v2.0.0 ([#358](https://github.com/angular-eslint/angular-eslint/issues/358)) ([737fd04](https://github.com/angular-eslint/angular-eslint/commit/737fd04946a9533698c04665c771d944ffbe430c)), closes [#328](https://github.com/angular-eslint/angular-eslint/issues/328) [#245](https://github.com/angular-eslint/angular-eslint/issues/245)
- **builder:** add maxWarnings option ([#351](https://github.com/angular-eslint/angular-eslint/issues/351)) ([5dc2dc3](https://github.com/angular-eslint/angular-eslint/commit/5dc2dc39e51cb3ec2b5e3c8596404dcb8a98877f))

### BREAKING CHANGES

- The format of results output has changed

- The `use-pipe-decorator` rule no longer exists for use

- feat(template-parser): updated use of parseTemplate to improve loc data

  - Requires @angular/compiler 11.2.0 and above

- feat(schematics): change way indent and quotes are handled by conversion schematics
  - The conversion schematic handle these rules differently

# [1.2.0](https://github.com/angular-eslint/angular-eslint/compare/v1.1.0...v1.2.0) (2021-02-06)

### Bug Fixes

- **eslint-plugin:** component-max-inline-declarations animations not being checked properly ([#313](https://github.com/angular-eslint/angular-eslint/issues/313)) ([61a2a0f](https://github.com/angular-eslint/angular-eslint/commit/61a2a0fc1caf19ced3781560052debf274d708a3))
- **eslint-plugin:** no-lifecycle-call invalid super calls not being reported ([#314](https://github.com/angular-eslint/angular-eslint/issues/314)) ([c44cd5d](https://github.com/angular-eslint/angular-eslint/commit/c44cd5d043a3d203efd1faaed4cbfee2c9ac2e9d))
- **eslint-plugin-template:** accessibility-valid-aria not reporting i… ([#278](https://github.com/angular-eslint/angular-eslint/issues/278)) ([391980f](https://github.com/angular-eslint/angular-eslint/commit/391980fd797787560cb56b71c2f741dd48a1c63f))

### Features

- **eslint-plugin:** add fixer for use-pipe-transform-interface ([#260](https://github.com/angular-eslint/angular-eslint/issues/260)) ([e3f4db6](https://github.com/angular-eslint/angular-eslint/commit/e3f4db6e5d4c062aabfc19d872dc9ee6861fcd44))
- **eslint-plugin-template:** add no duplicate attributes rule ([#302](https://github.com/angular-eslint/angular-eslint/issues/302)) ([c387de5](https://github.com/angular-eslint/angular-eslint/commit/c387de5223f7bb6dfb91a4c6748e307efbf56d9c)), closes [#293](https://github.com/angular-eslint/angular-eslint/issues/293)

# [1.1.0](https://github.com/angular-eslint/angular-eslint/compare/v1.0.0...v1.1.0) (2021-01-14)

### Bug Fixes

- **eslint-plugin:** handle DoBootstrap correctly in lifecycle rules ([#243](https://github.com/angular-eslint/angular-eslint/issues/243)) ([5010b3f](https://github.com/angular-eslint/angular-eslint/commit/5010b3f827b6089c089e5a5d55905aa3ac8839cc))
- **eslint-plugin-template:** conditional-complexity not reporting all cases ([#279](https://github.com/angular-eslint/angular-eslint/issues/279)) ([a4fd077](https://github.com/angular-eslint/angular-eslint/commit/a4fd077a062797c57f63abd9d0a78f60d40c73ca))

### Features

- **eslint-plugin-template:** accessibility-label-for ([#268](https://github.com/angular-eslint/angular-eslint/issues/268)) ([49ab76a](https://github.com/angular-eslint/angular-eslint/commit/49ab76a9ecaf427ba579093293cb7bc2cfc651c6))
