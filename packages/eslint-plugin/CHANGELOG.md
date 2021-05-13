# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [12.0.0](https://github.com/angular-eslint/angular-eslint/compare/v4.3.0...v12.0.0) (2021-05-13)

### Features

- update eslint to ^7.26.0, [@typescript-eslint](https://github.com/typescript-eslint) to 4.23.0 ([9e31c38](https://github.com/angular-eslint/angular-eslint/commit/9e31c3881a13d6ce3b642b9c23c67e2e0f2d1aa1))
- update to angular v12 ([c80008d](https://github.com/angular-eslint/angular-eslint/commit/c80008df8f6b9d08daf3043dffc1be45f8cfbe81))

# [4.3.0](https://github.com/angular-eslint/angular-eslint/compare/v4.2.1...v4.3.0) (2021-05-12)

**Note:** Version bump only for package @angular-eslint/eslint-plugin

## [4.2.1](https://github.com/angular-eslint/angular-eslint/compare/v4.2.0...v4.2.1) (2021-05-12)

**Note:** Version bump only for package @angular-eslint/eslint-plugin

# [4.2.0](https://github.com/angular-eslint/angular-eslint/compare/v4.1.0...v4.2.0) (2021-04-28)

**Note:** Version bump only for package @angular-eslint/eslint-plugin

# [4.1.0](https://github.com/angular-eslint/angular-eslint/compare/v4.0.0...v4.1.0) (2021-04-28)

**Note:** Version bump only for package @angular-eslint/eslint-plugin

# [4.0.0](https://github.com/angular-eslint/angular-eslint/compare/v3.0.1...v4.0.0) (2021-04-18)

### Features

- **schematics:** options for convert-tslint-to-eslint ([#419](https://github.com/angular-eslint/angular-eslint/issues/419)) ([18fd863](https://github.com/angular-eslint/angular-eslint/commit/18fd863d6948578db96252da57702338a8ea5ea0))

## [3.0.1](https://github.com/angular-eslint/angular-eslint/compare/v3.0.0...v3.0.1) (2021-04-18)

### Bug Fixes

- **eslint-plugin:** correctly expose recommended-extra config ([#418](https://github.com/angular-eslint/angular-eslint/issues/418)) ([f727d8c](https://github.com/angular-eslint/angular-eslint/commit/f727d8c05337908b4e8b9e5f34178bb54a390fb0))

# [3.0.0](https://github.com/angular-eslint/angular-eslint/compare/v2.1.1...v3.0.0) (2021-04-17)

### Features

- v3.0.0 ([#388](https://github.com/angular-eslint/angular-eslint/issues/388)) ([f92b184](https://github.com/angular-eslint/angular-eslint/commit/f92b184c5b0b57328d0a323ac8c89f1b3017b8d4))

## [2.1.1](https://github.com/angular-eslint/angular-eslint/compare/v2.1.0...v2.1.1) (2021-04-17)

### Bug Fixes

- **eslint-plugin:** `sort-ngmodule-metadata-arrays` reporting false positives ([#408](https://github.com/angular-eslint/angular-eslint/issues/408)) ([149152a](https://github.com/angular-eslint/angular-eslint/commit/149152a43dfad6ef841fd2784ef3168c0de8d91f))
- **eslint-plugin:** directive-class-suffix reporting selectorless directives ([#394](https://github.com/angular-eslint/angular-eslint/issues/394)) ([42d4e5d](https://github.com/angular-eslint/angular-eslint/commit/42d4e5db9a76703ff8556a4050e785a530a90611))

# [2.1.0](https://github.com/angular-eslint/angular-eslint/compare/v2.0.2...v2.1.0) (2021-04-11)

### Features

- **eslint-plugin:** add rule sort-ngmodule-metadata-arrays ([#386](https://github.com/angular-eslint/angular-eslint/issues/386)) ([935afdd](https://github.com/angular-eslint/angular-eslint/commit/935afdda16970f879c3dc45d45b6f5ef7d898d97))

## [2.0.2](https://github.com/angular-eslint/angular-eslint/compare/v2.0.1...v2.0.2) (2021-03-16)

**Note:** Version bump only for package @angular-eslint/eslint-plugin

## [2.0.1](https://github.com/angular-eslint/angular-eslint/compare/v2.0.0...v2.0.1) (2021-03-14)

### Bug Fixes

- **eslint-plugin-template:** conditional-complexity error from bundling ([#373](https://github.com/angular-eslint/angular-eslint/issues/373)) ([f466c01](https://github.com/angular-eslint/angular-eslint/commit/f466c0157f5ecefe6eae9aa726aaf08853c1894d))

# [2.0.0](https://github.com/angular-eslint/angular-eslint/compare/v1.2.0...v2.0.0) (2021-03-13)

### Bug Fixes

- add docs url for both plugins ([#360](https://github.com/angular-eslint/angular-eslint/issues/360)) ([4c9b068](https://github.com/angular-eslint/angular-eslint/commit/4c9b068a13b2ff8e7d5ebc3730564658d7cdc5c6))

### Features

- v2.0.0 ([#358](https://github.com/angular-eslint/angular-eslint/issues/358)) ([737fd04](https://github.com/angular-eslint/angular-eslint/commit/737fd04946a9533698c04665c771d944ffbe430c)), closes [#328](https://github.com/angular-eslint/angular-eslint/issues/328) [#245](https://github.com/angular-eslint/angular-eslint/issues/245)

### BREAKING CHANGES

- The format of results output has changed
- The rule no longer exists for use

- feat(template-parser): updated use of parseTemplate to improve loc data
- Requires @angular/compiler 11.2.0 and above

- feat(schematics): change way indent and quotes are handled by conversion schematics
- The conversion schematic handle these rules differently

# [1.2.0](https://github.com/angular-eslint/angular-eslint/compare/v1.1.0...v1.2.0) (2021-02-06)

### Bug Fixes

- **eslint-plugin:** component-max-inline-declarations animations not being checked properly ([#313](https://github.com/angular-eslint/angular-eslint/issues/313)) ([61a2a0f](https://github.com/angular-eslint/angular-eslint/commit/61a2a0fc1caf19ced3781560052debf274d708a3))
- **eslint-plugin:** no-lifecycle-call invalid super calls not being reported ([#314](https://github.com/angular-eslint/angular-eslint/issues/314)) ([c44cd5d](https://github.com/angular-eslint/angular-eslint/commit/c44cd5d043a3d203efd1faaed4cbfee2c9ac2e9d))

### Features

- **eslint-plugin:** add fixer for use-pipe-transform-interface ([#260](https://github.com/angular-eslint/angular-eslint/issues/260)) ([e3f4db6](https://github.com/angular-eslint/angular-eslint/commit/e3f4db6e5d4c062aabfc19d872dc9ee6861fcd44))

# [1.1.0](https://github.com/angular-eslint/angular-eslint/compare/v1.0.0...v1.1.0) (2021-01-14)

### Bug Fixes

- **eslint-plugin:** handle DoBootstrap correctly in lifecycle rules ([#243](https://github.com/angular-eslint/angular-eslint/issues/243)) ([5010b3f](https://github.com/angular-eslint/angular-eslint/commit/5010b3f827b6089c089e5a5d55905aa3ac8839cc))
