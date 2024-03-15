## 17.3.0 (2024-03-15)

### 🩹 Fixes

- update dependency tmp to v0.2.3

- migrate to nx 18

- update dependency ignore to v5.3.1

- update dependency eslint to v8.57.0

- update typescript-eslint packages to v7 (major)

- update dependency @angular/compiler to v17.3.0

- output declaration files in all packages

- **eslint-plugin-template:** [eqeqeq] calculate offset to find true absolute source span

### ❤️ Thank You

- Christian Svensson
- Dave
- James Henry
- Joey Jacobs
- Luis Estevez

## 17.2.1 (2024-01-20)

### 🩹 Fixes

- update typescript-eslint packages to v6.18.1

- update typescript-eslint packages to v6.19.0

- update dependency @angular/compiler to v17.1.0

- **eslint-plugin-template:** [no-call-expression] False negative with the new control flow syntax

- **eslint-plugin-template:** handle i18n tags on structural direcives

### ❤️ Thank You

- Adam Reisinger
- Matt Lewis

## 17.2.0 (2024-01-06)

### 🩹 Fixes

- update dependency eslint to v8.56.0

- update typescript-eslint packages to v6.18.0

- update dependency @angular/compiler to v17.0.8

- update dependency eslint-scope to v8

- **eslint-plugin-template:** fix control flow syntax with i18n rule

### ❤️ Thank You

- Matt Lewis
- Steven Chim

## 17.1.1

### 🩹 Fixes

- update nrwl monorepo to v17.1.3

- update typescript-eslint packages to v6.12.0

- update dependency ignore to v5.3.0

- update dependency eslint to v8.54.0

- update typescript-eslint packages to v6.13.0

- update typescript-eslint packages to v6.13.1

- **eslint-plugin-template:** [prefer-ngsrc] Do not prefer ngsrc for base64-encoded strings

- **eslint-plugin-template:** [prefer-control-flow] prevent error when…

### ❤️ Thank You

- Christian Svensson
- Daniel Kimmich
- Luis Estevez

## 17.1.0

### 🚀 Features

- **eslint-plugin-template:** [no-negated-async] values used with the async pipe are not negated

- **eslint-plugin-template:** [prefer-control-flow] add rule

### 🩹 Fixes

- **eslint-plugin-template:** [attributes-order] fixes for structural directives and i18n ordering

### ❤️ Thank You

- Adrian Baran
- Daniel Kimmich
- Phil McCloghry-Laing

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [17.0.1](https://github.com/angular-eslint/angular-eslint/compare/v17.0.0...v17.0.1) (2023-11-09)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [17.0.0](https://github.com/angular-eslint/angular-eslint/compare/v16.3.1...v17.0.0) (2023-11-08)

### Bug Fixes

- no declarations for eslint plugins ([2498238](https://github.com/angular-eslint/angular-eslint/commit/2498238ac64caaa539ac9d165157c6c4c937e747))

### Features

- **eslint-plugin-template:** [prefer-self-closing-tags] consider ng-content and ng-template elements ([#1573](https://github.com/angular-eslint/angular-eslint/issues/1573)) ([8e97d20](https://github.com/angular-eslint/angular-eslint/commit/8e97d20752669c2afa7b2ae456d16a96aabd8a80))

## [16.3.1](https://github.com/angular-eslint/angular-eslint/compare/v16.3.0...v16.3.1) (2023-11-08)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [16.3.0](https://github.com/angular-eslint/angular-eslint/compare/v16.2.0...v16.3.0) (2023-11-08)

### Bug Fixes

- generate type declarations for published packages ([#1586](https://github.com/angular-eslint/angular-eslint/issues/1586)) ([ba5740b](https://github.com/angular-eslint/angular-eslint/commit/ba5740bc76c994d1fe35be7c1c7fee3ced647aff))
- update dependency axobject-query to v4 ([#1581](https://github.com/angular-eslint/angular-eslint/issues/1581)) ([0b6cd1a](https://github.com/angular-eslint/angular-eslint/commit/0b6cd1a2f05e4407e7422e337cc45234dd1d6209))

### Features

- **eslint-plugin-template:** allow `alias` option in [use-track-by-function] ([#1497](https://github.com/angular-eslint/angular-eslint/issues/1497)) ([354d394](https://github.com/angular-eslint/angular-eslint/commit/354d394d2ea866b4f21cbbad84d84b2e102066f5))

# [16.2.0](https://github.com/angular-eslint/angular-eslint/compare/v16.1.2...v16.2.0) (2023-09-17)

### Bug Fixes

- **eslint-plugin-template:** [prefer-self-closing-tags] improve code style of fixer result ([#1520](https://github.com/angular-eslint/angular-eslint/issues/1520)) ([6a86f19](https://github.com/angular-eslint/angular-eslint/commit/6a86f1903dc91cc8c46b910b22c89c66cae7e416))
- **eslint-plugin-template:** fix fixer of inline templates ([#1472](https://github.com/angular-eslint/angular-eslint/issues/1472)) ([470e12b](https://github.com/angular-eslint/angular-eslint/commit/470e12b5b482857735e2140e3524a5726d4fc6a8))
- update dependency axobject-query to v3.2.1 ([#1524](https://github.com/angular-eslint/angular-eslint/issues/1524)) ([bb171d4](https://github.com/angular-eslint/angular-eslint/commit/bb171d489a099af8109464e8efeb08273d8a1dbd))

### Features

- **eslint-plugin-template:** [prefer-ngsrc] add rule ([#1477](https://github.com/angular-eslint/angular-eslint/issues/1477)) ([0cfbc80](https://github.com/angular-eslint/angular-eslint/commit/0cfbc8096185a3851ca30d2f48cd939f027b1774))

## [16.1.2](https://github.com/angular-eslint/angular-eslint/compare/v16.1.1...v16.1.2) (2023-09-04)

### Bug Fixes

- update dependency @angular/compiler to v16.2.3 ([#1458](https://github.com/angular-eslint/angular-eslint/issues/1458)) ([2b895a8](https://github.com/angular-eslint/angular-eslint/commit/2b895a8b45dfc16a8d03e149c47ef1c47c414e2e))

## [16.1.1](https://github.com/angular-eslint/angular-eslint/compare/v16.1.0...v16.1.1) (2023-08-20)

### Bug Fixes

- **eslint-plugin-template:** [attributes-order] Handle explicit ng-template usage ([#1465](https://github.com/angular-eslint/angular-eslint/issues/1465)) ([7d1f592](https://github.com/angular-eslint/angular-eslint/commit/7d1f5926fdad1adddc6f060d5bb3053562d0903f))
- **eslint-plugin-template:** update links to Angular i18n docs ([#1476](https://github.com/angular-eslint/angular-eslint/issues/1476)) ([9633058](https://github.com/angular-eslint/angular-eslint/commit/9633058f014842b66e7ff9d81f90520ce7628a8a))

# [16.1.0](https://github.com/angular-eslint/angular-eslint/compare/v16.0.3...v16.1.0) (2023-07-12)

### Bug Fixes

- **eslint-plugin-template:** [attributes-order] fixes for structural directives and "dotted" names ([#1448](https://github.com/angular-eslint/angular-eslint/issues/1448)) ([90c0e91](https://github.com/angular-eslint/angular-eslint/commit/90c0e916654297b29cabf8289b1811ed307018ab))
- **eslint-plugin:** [valid-aria] tristate "mixed" value not handled ([#1398](https://github.com/angular-eslint/angular-eslint/issues/1398)) ([e7c762a](https://github.com/angular-eslint/angular-eslint/commit/e7c762a33177fd915f5c3c9cb3a36292ba126e61))
- update dependency aria-query to v5.3.0 ([#1441](https://github.com/angular-eslint/angular-eslint/issues/1441)) ([4b3a9dd](https://github.com/angular-eslint/angular-eslint/commit/4b3a9dd3e1b9b4ce868b7c9810fa53e834f0acf6))
- update typescript-eslint packages to v5.59.8 ([#1393](https://github.com/angular-eslint/angular-eslint/issues/1393)) ([5b0e87e](https://github.com/angular-eslint/angular-eslint/commit/5b0e87e47756685e2b71fb29d4657cbe715496b6))
- update typescript-eslint packages to v5.59.9 ([#1420](https://github.com/angular-eslint/angular-eslint/issues/1420)) ([fdd817f](https://github.com/angular-eslint/angular-eslint/commit/fdd817f706031826c921013f750331b3342053ed))
- update typescript-eslint packages to v5.62.0 ([#1444](https://github.com/angular-eslint/angular-eslint/issues/1444)) ([4affbf4](https://github.com/angular-eslint/angular-eslint/commit/4affbf421f92528b5616c2b3cd60373b136374c7))

### Features

- **eslint-plugin-template:** [no-duplicate-attributes] add allowStylePrecedenceDuplicates option ([#1407](https://github.com/angular-eslint/angular-eslint/issues/1407)) ([6f69af8](https://github.com/angular-eslint/angular-eslint/commit/6f69af8fd39b130f15453c46b1a9688360566c8b))
- **eslint-plugin-template:** [self-closing-tags] add rule ([#1322](https://github.com/angular-eslint/angular-eslint/issues/1322)) ([6d26c59](https://github.com/angular-eslint/angular-eslint/commit/6d26c590e4b15e0b28a6ff7467560537e2b9b92d))

## [16.0.3](https://github.com/angular-eslint/angular-eslint/compare/v16.0.2...v16.0.3) (2023-05-29)

### Bug Fixes

- update typescript-eslint packages to v5.59.7 ([#1392](https://github.com/angular-eslint/angular-eslint/issues/1392)) ([cf40e34](https://github.com/angular-eslint/angular-eslint/commit/cf40e349943ec8acf97515dec344099a24f9c2c5))

## [16.0.2](https://github.com/angular-eslint/angular-eslint/compare/v16.0.1...v16.0.2) (2023-05-17)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

## [16.0.1](https://github.com/angular-eslint/angular-eslint/compare/v16.0.0...v16.0.1) (2023-05-03)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [16.0.0](https://github.com/angular-eslint/angular-eslint/compare/v16.0.0-alpha.1...v16.0.0) (2023-05-03)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

## [15.2.1](https://github.com/angular-eslint/angular-eslint/compare/v15.2.0...v15.2.1) (2023-02-10)

### Bug Fixes

- **eslint-plugin-template:** [i18n] handle ng-template properly ([#1257](https://github.com/angular-eslint/angular-eslint/issues/1257)) ([7b0877d](https://github.com/angular-eslint/angular-eslint/commit/7b0877dbaceefb60f933895034bad06e995b867e))
- update typescript-eslint packages to v5.48.2 ([#1278](https://github.com/angular-eslint/angular-eslint/issues/1278)) ([69d56a7](https://github.com/angular-eslint/angular-eslint/commit/69d56a7dfac576bff136329ce46917a8257a6aab))

# [15.2.0](https://github.com/angular-eslint/angular-eslint/compare/v15.1.0...v15.2.0) (2023-01-14)

### Bug Fixes

- update typescript-eslint packages to v5.45.1 ([#1239](https://github.com/angular-eslint/angular-eslint/issues/1239)) ([abb7f79](https://github.com/angular-eslint/angular-eslint/commit/abb7f794b685a57ce696db9624a2ce66f81c6b4b))
- update typescript-eslint packages to v5.48.1 ([#1255](https://github.com/angular-eslint/angular-eslint/issues/1255)) ([11151d1](https://github.com/angular-eslint/angular-eslint/commit/11151d17dc82d04276169e3c898e2aa7f11136b1))

### Features

- **eslint-plugin-template:** [i18n] option to require i18n metadata meaning ([#1234](https://github.com/angular-eslint/angular-eslint/issues/1234)) ([4ef0290](https://github.com/angular-eslint/angular-eslint/commit/4ef02902f5216ee8a6fab1faf1798ac559341ffc))
- **eslint-plugin-template:** [no-interpolation-in-attributes] new rule added ([#1242](https://github.com/angular-eslint/angular-eslint/issues/1242)) ([977cb3a](https://github.com/angular-eslint/angular-eslint/commit/977cb3ad623c4d70a0e83b04c0cbe409edf88515))

# [15.1.0](https://github.com/angular-eslint/angular-eslint/compare/v15.0.0...v15.1.0) (2022-11-24)

### Bug Fixes

- **eslint-plugin-template:** [accessibility-valid-aria] use Number() to parse numeric values ([#1218](https://github.com/angular-eslint/angular-eslint/issues/1218)) ([6fe40d6](https://github.com/angular-eslint/angular-eslint/commit/6fe40d672197532176686f1c5c8ab080713334bf))
- **eslint-plugin-template:** [i18n] allow more attributes by default ([#1220](https://github.com/angular-eslint/angular-eslint/issues/1220)) ([4232b1c](https://github.com/angular-eslint/angular-eslint/commit/4232b1c1892189623ead2ccd68fcb6d179186e92))
- update typescript-eslint packages to v5.44.0 ([#1222](https://github.com/angular-eslint/angular-eslint/issues/1222)) ([5750e3a](https://github.com/angular-eslint/angular-eslint/commit/5750e3af9c7d9b91f5f4cd2fb524625b215bf4b0))

### Features

- **eslint-plugin-template:** [no-call-expression] add allowList option ([#1217](https://github.com/angular-eslint/angular-eslint/issues/1217)) ([a69c809](https://github.com/angular-eslint/angular-eslint/commit/a69c809cd31f142d2f5aff1c34afeb6e4a607a9c))

# [15.0.0](https://github.com/angular-eslint/angular-eslint/compare/v15.0.0-alpha.5...v15.0.0) (2022-11-20)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [14.4.0](https://github.com/angular-eslint/angular-eslint/compare/v14.3.1...v14.4.0) (2022-11-20)

### Features

- **utils:** export template parser services ([#1211](https://github.com/angular-eslint/angular-eslint/issues/1211)) ([34a62d2](https://github.com/angular-eslint/angular-eslint/commit/34a62d25f02716eb0d55f095ce732876a4f7590b))

## [14.3.1](https://github.com/angular-eslint/angular-eslint/compare/v14.3.0...v14.3.1) (2022-11-20)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [14.3.0](https://github.com/angular-eslint/angular-eslint/compare/v14.2.0...v14.3.0) (2022-11-17)

### Features

- **eslint-plugin-template:** [accessibility-elements-content] add allowList option ([#1201](https://github.com/angular-eslint/angular-eslint/issues/1201)) ([3877f43](https://github.com/angular-eslint/angular-eslint/commit/3877f4350213d934dc3eac440a2dc6168aeef558))
- **eslint-plugin-template:** [no-inline-styles] add rule ([#1162](https://github.com/angular-eslint/angular-eslint/issues/1162)) ([7e1aadf](https://github.com/angular-eslint/angular-eslint/commit/7e1aadf47913124c09a000e231748c3ea981750b))

# [14.2.0](https://github.com/angular-eslint/angular-eslint/compare/v14.1.2...v14.2.0) (2022-11-15)

### Bug Fixes

- update dependency aria-query to v5.1.3 ([#1183](https://github.com/angular-eslint/angular-eslint/issues/1183)) ([7c5b299](https://github.com/angular-eslint/angular-eslint/commit/7c5b2993dc9fcc235b869bab63d28766637b3147))
- update dependency axobject-query to v3.1.1 ([#1184](https://github.com/angular-eslint/angular-eslint/issues/1184)) ([dcfd43d](https://github.com/angular-eslint/angular-eslint/commit/dcfd43dfc9ffb4acbe127911ae8e9b1de6210839))
- update typescript-eslint packages to v5.38.1 ([#1152](https://github.com/angular-eslint/angular-eslint/issues/1152)) ([8f6d0ef](https://github.com/angular-eslint/angular-eslint/commit/8f6d0ef1048eac4113cb3efe53ed466b50aff056))
- update typescript-eslint packages to v5.43.0 ([#1190](https://github.com/angular-eslint/angular-eslint/issues/1190)) ([2a4716a](https://github.com/angular-eslint/angular-eslint/commit/2a4716abd83230c2fe4c3ba377fc4fbe527d7b12))

### Features

- **eslint-plugin-template:** [accessibility-interactive-supports-focus] add rule ([#1134](https://github.com/angular-eslint/angular-eslint/issues/1134)) ([d99d8c1](https://github.com/angular-eslint/angular-eslint/commit/d99d8c1c23ece85c5ee37c3515912e90a335be46))
- **eslint-plugin-template:** [accessibility-role-has-required-aria] add rule ([#1100](https://github.com/angular-eslint/angular-eslint/issues/1100)) ([f684df0](https://github.com/angular-eslint/angular-eslint/commit/f684df040ebdf96b695f07f2e3fa6bfe2310c20e))
- **eslint-plugin-template:** [attributes-order] add rule with fixer ([#1066](https://github.com/angular-eslint/angular-eslint/issues/1066)) ([4c789c7](https://github.com/angular-eslint/angular-eslint/commit/4c789c7546c7306c1a010f78fac4582b0c6efdc0))
- **eslint-plugin-template:** [no-duplicate-attributes] Add option to ignore properties ([#1104](https://github.com/angular-eslint/angular-eslint/issues/1104)) ([018d390](https://github.com/angular-eslint/angular-eslint/commit/018d3906c2569df7dda01fd205e1138aec3f1d0c))
- update typescript-eslint packages to v5.38.0 ([#1140](https://github.com/angular-eslint/angular-eslint/issues/1140)) ([85b4b47](https://github.com/angular-eslint/angular-eslint/commit/85b4b47acea84ae8f633f348805e22aea36de113))

## [14.1.2](https://github.com/angular-eslint/angular-eslint/compare/v14.1.1...v14.1.2) (2022-09-21)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

## [14.1.1](https://github.com/angular-eslint/angular-eslint/compare/v14.1.0...v14.1.1) (2022-09-18)

### Bug Fixes

- **eslint-plugin-template:** [click-events-have-key-events]: handle additional outputs ([#1101](https://github.com/angular-eslint/angular-eslint/issues/1101)) ([c608cdb](https://github.com/angular-eslint/angular-eslint/commit/c608cdbfabb81cfbf542a3c846711853cfcbbfbd))

# [14.1.0](https://github.com/angular-eslint/angular-eslint/compare/v14.0.4...v14.1.0) (2022-09-18)

### Features

- update typescript-eslint packages to v5.37.0 ([#1138](https://github.com/angular-eslint/angular-eslint/issues/1138)) ([96435a8](https://github.com/angular-eslint/angular-eslint/commit/96435a881f40ca9a124c8f44009a6f656f31e1f2))

## [14.0.4](https://github.com/angular-eslint/angular-eslint/compare/v14.0.3...v14.0.4) (2022-09-08)

### Bug Fixes

- support TS 4.8 with Angular 14.2, update dependencies ([#1123](https://github.com/angular-eslint/angular-eslint/issues/1123)) ([a780b59](https://github.com/angular-eslint/angular-eslint/commit/a780b592b42a61f149ae3d1d0f5c55808cb755df))

## [14.0.3](https://github.com/angular-eslint/angular-eslint/compare/v14.0.2...v14.0.3) (2022-08-23)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

## [14.0.2](https://github.com/angular-eslint/angular-eslint/compare/v14.0.1...v14.0.2) (2022-07-09)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

## [14.0.1](https://github.com/angular-eslint/angular-eslint/compare/v14.0.0...v14.0.1) (2022-07-08)

### Bug Fixes

- remaining references to master (now main) ([#1083](https://github.com/angular-eslint/angular-eslint/issues/1083)) ([8d36232](https://github.com/angular-eslint/angular-eslint/commit/8d36232435e5e09f870fc42c40327cedd703749f))

# [14.0.0](https://github.com/angular-eslint/angular-eslint/compare/v13.5.0...v14.0.0) (2022-06-23)

### Features

- update typescript-eslint packages to v5.28.0 ([#1045](https://github.com/angular-eslint/angular-eslint/issues/1045)) ([9e8c340](https://github.com/angular-eslint/angular-eslint/commit/9e8c3406de716d1d5e7f45e06b06700af3861f65))
- update typescript-eslint packages to v5.29.0 ([#1063](https://github.com/angular-eslint/angular-eslint/issues/1063)) ([02856cb](https://github.com/angular-eslint/angular-eslint/commit/02856cbc6116491eaa634a3cbdcd38d6bffda64c))

# [13.5.0](https://github.com/angular-eslint/angular-eslint/compare/v13.4.0...v13.5.0) (2022-06-12)

### Features

- **eslint-plugin-template:** [button-has-type] add rule ([#928](https://github.com/angular-eslint/angular-eslint/issues/928)) ([f19bb30](https://github.com/angular-eslint/angular-eslint/commit/f19bb30bf875eacb3bd82709687e4f6ecd6abac7))

# [13.4.0](https://github.com/angular-eslint/angular-eslint/compare/v13.3.0...v13.4.0) (2022-06-11)

### Features

- update typescript-eslint packages to v5.27.1 ([#1022](https://github.com/angular-eslint/angular-eslint/issues/1022)) ([99e8d4a](https://github.com/angular-eslint/angular-eslint/commit/99e8d4a256b8d2d71ee9b809649cb0846fdadeb9))

# [13.3.0](https://github.com/angular-eslint/angular-eslint/compare/v13.2.1...v13.3.0) (2022-06-10)

### Bug Fixes

- **eslint-plugin-template:** [eqeqeq] update suggest message ([#1000](https://github.com/angular-eslint/angular-eslint/issues/1000)) ([821cb8e](https://github.com/angular-eslint/angular-eslint/commit/821cb8ec0f69beb0cc7d1fb60ad653a1c3c77152))

### Features

- **eslint-plugin-template:** [i18n] add requireDescription option ([#988](https://github.com/angular-eslint/angular-eslint/issues/988)) ([8f55ba8](https://github.com/angular-eslint/angular-eslint/commit/8f55ba832dfe54a4b44334802c3691f839e3ce5d))

## [13.2.1](https://github.com/angular-eslint/angular-eslint/compare/v13.2.0...v13.2.1) (2022-04-14)

### Bug Fixes

- **eslint-plugin-template:** false positive conditional complexity in BoundAttribute > Interpolation ([#986](https://github.com/angular-eslint/angular-eslint/issues/986)) ([c3f3120](https://github.com/angular-eslint/angular-eslint/commit/c3f3120b57f7dfe7ff1ff3f3a8791b2cf988e905))

# [13.2.0](https://github.com/angular-eslint/angular-eslint/compare/v13.1.0...v13.2.0) (2022-04-03)

### Features

- **parser:** propagate parse errors from angular compiler ([#969](https://github.com/angular-eslint/angular-eslint/issues/969)) ([ab9b496](https://github.com/angular-eslint/angular-eslint/commit/ab9b496095c7194d614394c04548f6848c0d6aff))

# [13.1.0](https://github.com/angular-eslint/angular-eslint/compare/v13.0.1...v13.1.0) (2022-02-13)

### Bug Fixes

- **eslint-plugin-template:** [i18n] do not throw when compiler returns null i18n description ([#892](https://github.com/angular-eslint/angular-eslint/issues/892)) ([d349149](https://github.com/angular-eslint/angular-eslint/commit/d3491492b925bd7855d86f7a1fd90297acaee743))
- rule docs links in create-eslint-rule utils ([#907](https://github.com/angular-eslint/angular-eslint/issues/907)) ([94f6e21](https://github.com/angular-eslint/angular-eslint/commit/94f6e2126088ac300e7a010a45e575cadd4d8e78))

### Features

- **eslint-plugin-template:** [i18n] add checkDuplicateId option ([#868](https://github.com/angular-eslint/angular-eslint/issues/868)) ([edaf46f](https://github.com/angular-eslint/angular-eslint/commit/edaf46f2f321b9d5a3ba148048b997366e79495d))
- update angular/compiler to v13.2.2 ([#834](https://github.com/angular-eslint/angular-eslint/issues/834)) ([9847978](https://github.com/angular-eslint/angular-eslint/commit/9847978778c3772425d727214f0600a04b6c234c))

## [13.0.1](https://github.com/angular-eslint/angular-eslint/compare/v13.0.0...v13.0.1) (2021-11-19)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [13.0.0](https://github.com/angular-eslint/angular-eslint/compare/v12.7.0...v13.0.0) (2021-11-18)

### Features

- angular-eslint v13 ([#780](https://github.com/angular-eslint/angular-eslint/issues/780)) ([f7ce631](https://github.com/angular-eslint/angular-eslint/commit/f7ce631524dd7834a422a5ac93a4c0534f9f23fa))

# [12.7.0](https://github.com/angular-eslint/angular-eslint/compare/v12.6.1...v12.7.0) (2021-11-18)

### Features

- **i18n:** option to require description for i18n metadata ([#804](https://github.com/angular-eslint/angular-eslint/issues/804)) ([7d072e2](https://github.com/angular-eslint/angular-eslint/commit/7d072e2ec053f388adce00be54c75d8c76373699))

## [12.6.1](https://github.com/angular-eslint/angular-eslint/compare/v12.6.0...v12.6.1) (2021-10-26)

### Bug Fixes

- pin dependencies ([#726](https://github.com/angular-eslint/angular-eslint/issues/726)) ([5c21189](https://github.com/angular-eslint/angular-eslint/commit/5c211898d7a678dbc08f9c9205828ed92b28808d))

# [12.6.0](https://github.com/angular-eslint/angular-eslint/compare/v12.5.0...v12.6.0) (2021-10-25)

### Bug Fixes

- **eslint-plugin-template:** [i18n] ignore empty strings and non-texts within `BoundText` by default ([#683](https://github.com/angular-eslint/angular-eslint/issues/683)) ([4075643](https://github.com/angular-eslint/angular-eslint/commit/4075643f259c791f1995c207ca14c9c93c3098d6))

### Features

- **bundled-angular-compiler:** create own bundle for `@angular/compiler` ([#720](https://github.com/angular-eslint/angular-eslint/issues/720)) ([0c42299](https://github.com/angular-eslint/angular-eslint/commit/0c422993496bb2670fbd31f55a5fe829704f5112))

# [12.5.0](https://github.com/angular-eslint/angular-eslint/compare/v12.4.1...v12.5.0) (2021-09-20)

### Bug Fixes

- **eslint-plugin-template:** [mouse-events-have-key-events] ignore custom components ([#680](https://github.com/angular-eslint/angular-eslint/issues/680)) ([f65874b](https://github.com/angular-eslint/angular-eslint/commit/f65874b6b1fb012f1f8a1a564b6348cd7ae2117f))
- **eslint-plugin-template:** support escape chars in inline templates ([#691](https://github.com/angular-eslint/angular-eslint/issues/691)) ([8b89ec7](https://github.com/angular-eslint/angular-eslint/commit/8b89ec7ba1ebdd5a29914bac457387d4b65bd691))

## [12.4.1](https://github.com/angular-eslint/angular-eslint/compare/v12.4.0...v12.4.1) (2021-09-09)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [12.4.0](https://github.com/angular-eslint/angular-eslint/compare/v12.3.1...v12.4.0) (2021-09-09)

### Bug Fixes

- **eslint-plugin-template:** [i18n] fixes some incorrect reports ([#665](https://github.com/angular-eslint/angular-eslint/issues/665)) ([a011b9d](https://github.com/angular-eslint/angular-eslint/commit/a011b9d6711482f0713e30208d46b38ce266741d))
- **eslint-plugin-template:** [no-call-expression]: `FunctionCall`s not being reported ([#601](https://github.com/angular-eslint/angular-eslint/issues/601)) ([5552b13](https://github.com/angular-eslint/angular-eslint/commit/5552b13a87ff0a04ea92a12f54decfbb0c4f984e))
- **eslint-plugin-template:** include more checks for `isHiddenFromScreenReader` ([#545](https://github.com/angular-eslint/angular-eslint/issues/545)) ([db2bc05](https://github.com/angular-eslint/angular-eslint/commit/db2bc057458bf7080b7848934dd6a30582dced27))

## [12.3.1](https://github.com/angular-eslint/angular-eslint/compare/v12.3.0...v12.3.1) (2021-07-15)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [12.3.0](https://github.com/angular-eslint/angular-eslint/compare/v12.2.2...v12.3.0) (2021-07-13)

### Features

- **schematics:** better support @angular/cli 12.1 ([#591](https://github.com/angular-eslint/angular-eslint/issues/591)) ([c5da07b](https://github.com/angular-eslint/angular-eslint/commit/c5da07b2d0c506dde24f0abc3e212db9deeaca82))

## [12.2.2](https://github.com/angular-eslint/angular-eslint/compare/v12.2.1...v12.2.2) (2021-07-10)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

## [12.2.1](https://github.com/angular-eslint/angular-eslint/compare/v12.2.0...v12.2.1) (2021-07-10)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [12.2.0](https://github.com/angular-eslint/angular-eslint/compare/v12.1.0...v12.2.0) (2021-06-20)

### Bug Fixes

- **eslint-plugin-template:** [accessibility-table-scope] ignore custom elements ([#550](https://github.com/angular-eslint/angular-eslint/issues/550)) ([53eb56d](https://github.com/angular-eslint/angular-eslint/commit/53eb56d9baa04acf4c228a7a8c6d3d546556b82b))
- **eslint-plugin-template:** [accessibility-valid-aria] ignore custom elements ([#552](https://github.com/angular-eslint/angular-eslint/issues/552)) ([f6466ec](https://github.com/angular-eslint/angular-eslint/commit/f6466ec2b52b0706e65c52bc02cb96c226e7e533))
- **eslint-plugin-template:** [no-autofocus] ignore custom elements ([#540](https://github.com/angular-eslint/angular-eslint/issues/540)) ([366d9df](https://github.com/angular-eslint/angular-eslint/commit/366d9df21415c82b22f2d9edcbcf53a39c70aa86))
- **eslint-plugin-template:** [no-positive-tabindex] ignore custom elements ([#551](https://github.com/angular-eslint/angular-eslint/issues/551)) ([5e33995](https://github.com/angular-eslint/angular-eslint/commit/5e33995ad7742555a4726b9f612fe5c4db190505))

### Features

- **eslint-plugin-template:** [no-positive-tabindex] add suggestion ([#541](https://github.com/angular-eslint/angular-eslint/issues/541)) ([0582c2a](https://github.com/angular-eslint/angular-eslint/commit/0582c2a91c50a2f777fa6c2f4bc71252f51b8073))

# [12.1.0](https://github.com/angular-eslint/angular-eslint/compare/v12.0.0...v12.1.0) (2021-05-30)

### Bug Fixes

- **eslint-plugin-template:** [18n] ignore `checkAttributes` properly ([#467](https://github.com/angular-eslint/angular-eslint/issues/467)) ([20e54d7](https://github.com/angular-eslint/angular-eslint/commit/20e54d7699e499478b79735d2f5f7a4f1d419f21))
- **eslint-plugin-template:** [eqeqeq] change fix to suggest ([#465](https://github.com/angular-eslint/angular-eslint/issues/465)) ([a497fde](https://github.com/angular-eslint/angular-eslint/commit/a497fde0ddab7d6b32dd7b16138b00408258829a))
- **eslint-plugin-template:** [no-negated-async] ignore double-bang ([#450](https://github.com/angular-eslint/angular-eslint/issues/450)) ([9d06488](https://github.com/angular-eslint/angular-eslint/commit/9d064880ec1370e51d93848f7cb4575fd5f078f3))
- **utils:** support passing `data` and `suggestions` individually for each error ([#491](https://github.com/angular-eslint/angular-eslint/issues/491)) ([70b01bd](https://github.com/angular-eslint/angular-eslint/commit/70b01bd83ddcaf3c57cab0701edb424dabf3a25f))

### Features

- **eslint-plugin-template:** [accessibility-table-scope] add fixer ([#490](https://github.com/angular-eslint/angular-eslint/issues/490)) ([f0c4cea](https://github.com/angular-eslint/angular-eslint/commit/f0c4cea954c0cd3fedbda753c055037806574132))
- **eslint-plugin-template:** [accessibility-valid-aria] add suggestion ([#489](https://github.com/angular-eslint/angular-eslint/issues/489)) ([678e1b5](https://github.com/angular-eslint/angular-eslint/commit/678e1b585734cc080b68a32b633c059b15388a4a))
- **eslint-plugin-template:** [no-any] add suggestion ([#486](https://github.com/angular-eslint/angular-eslint/issues/486)) ([720e869](https://github.com/angular-eslint/angular-eslint/commit/720e869e1389c9d3f1b890e08158f4a58c4b122c))
- **eslint-plugin-template:** [no-autofocus] add fixer ([#485](https://github.com/angular-eslint/angular-eslint/issues/485)) ([9450b7d](https://github.com/angular-eslint/angular-eslint/commit/9450b7da90de0d49bf50d02a6ea3e625582399ab))
- **eslint-plugin-template:** [no-distracting-elements] add fixer ([#488](https://github.com/angular-eslint/angular-eslint/issues/488)) ([9cefe67](https://github.com/angular-eslint/angular-eslint/commit/9cefe6792a58f1d7b2d4dbc6828a1642f8c707da))
- **eslint-plugin-template:** [no-duplicate-attributes] add suggestion ([#495](https://github.com/angular-eslint/angular-eslint/issues/495)) ([62cadcd](https://github.com/angular-eslint/angular-eslint/commit/62cadcd9ebe212bb43495a2926a9785ddb8829fb))
- **eslint-plugin-template:** [no-negated-async] add suggestion ([#487](https://github.com/angular-eslint/angular-eslint/issues/487)) ([0b3f9eb](https://github.com/angular-eslint/angular-eslint/commit/0b3f9eb85b6315e123b4a1c03730929d7202219f))

# [12.0.0](https://github.com/angular-eslint/angular-eslint/compare/v4.3.0...v12.0.0) (2021-05-13)

### Bug Fixes

- **template-parser:** add missing `Conditional` and its keys to `VisitorKeys` ([#445](https://github.com/angular-eslint/angular-eslint/issues/445)) ([5ad0f1a](https://github.com/angular-eslint/angular-eslint/commit/5ad0f1aeca244dbd27496e5a2d8c569994a24dcf))

### Features

- update tslint-to-eslint-config to 2.4.0 ([7352ad2](https://github.com/angular-eslint/angular-eslint/commit/7352ad260644952abebf06773703f7b550d870fb))
- **eslint-plugin-template:** add rule eqeqeq ([#444](https://github.com/angular-eslint/angular-eslint/issues/444)) ([e15148c](https://github.com/angular-eslint/angular-eslint/commit/e15148cc31d54641815d08f97f14b3388d8dcde2))
- update eslint to ^7.26.0, [@typescript-eslint](https://github.com/typescript-eslint) to 4.23.0 ([9e31c38](https://github.com/angular-eslint/angular-eslint/commit/9e31c3881a13d6ce3b642b9c23c67e2e0f2d1aa1))
- update to angular v12 ([c80008d](https://github.com/angular-eslint/angular-eslint/commit/c80008df8f6b9d08daf3043dffc1be45f8cfbe81))

# [4.3.0](https://github.com/angular-eslint/angular-eslint/compare/v4.2.1...v4.3.0) (2021-05-12)

### Features

- **eslint-plugin-template:** add rule accessibility-label-has-associated-control ([#392](https://github.com/angular-eslint/angular-eslint/issues/392)) ([0851f3e](https://github.com/angular-eslint/angular-eslint/commit/0851f3eeda54c8c9ad01460b91cf8cf67017f1db))

## [4.2.1](https://github.com/angular-eslint/angular-eslint/compare/v4.2.0...v4.2.1) (2021-05-12)

### Bug Fixes

- **eslint-plugin-template:** no-negated-async message tweak ([#427](https://github.com/angular-eslint/angular-eslint/issues/427)) ([08a8330](https://github.com/angular-eslint/angular-eslint/commit/08a8330003a039c353446724d3e363e670c529e0))

# [4.2.0](https://github.com/angular-eslint/angular-eslint/compare/v4.1.0...v4.2.0) (2021-04-28)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [4.1.0](https://github.com/angular-eslint/angular-eslint/compare/v4.0.0...v4.1.0) (2021-04-28)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [4.0.0](https://github.com/angular-eslint/angular-eslint/compare/v3.0.1...v4.0.0) (2021-04-18)

### Features

- **schematics:** options for convert-tslint-to-eslint ([#419](https://github.com/angular-eslint/angular-eslint/issues/419)) ([18fd863](https://github.com/angular-eslint/angular-eslint/commit/18fd863d6948578db96252da57702338a8ea5ea0))

## [3.0.1](https://github.com/angular-eslint/angular-eslint/compare/v3.0.0...v3.0.1) (2021-04-18)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

# [3.0.0](https://github.com/angular-eslint/angular-eslint/compare/v2.1.1...v3.0.0) (2021-04-17)

### Features

- v3.0.0 ([#388](https://github.com/angular-eslint/angular-eslint/issues/388)) ([f92b184](https://github.com/angular-eslint/angular-eslint/commit/f92b184c5b0b57328d0a323ac8c89f1b3017b8d4))

## [2.1.1](https://github.com/angular-eslint/angular-eslint/compare/v2.1.0...v2.1.1) (2021-04-17)

### Bug Fixes

- **eslint-plugin-template:** [i18n] remove unsafe fix ([#411](https://github.com/angular-eslint/angular-eslint/issues/411)) ([3246b8a](https://github.com/angular-eslint/angular-eslint/commit/3246b8a2e762d70cae5512aed06216e4c0669257))

# [2.1.0](https://github.com/angular-eslint/angular-eslint/compare/v2.0.2...v2.1.0) (2021-04-11)

### Bug Fixes

- **eslint-plugin:** no-call-expression incorrect reports for conditionals ([#390](https://github.com/angular-eslint/angular-eslint/issues/390)) ([fa9cc73](https://github.com/angular-eslint/angular-eslint/commit/fa9cc7369446f3a7605554754ac57485bf1b1bfb))
- **eslint-plugin-template:** accessibility-elements-content not allowing some attributes/inputs ([#397](https://github.com/angular-eslint/angular-eslint/issues/397)) ([ffedaa2](https://github.com/angular-eslint/angular-eslint/commit/ffedaa24c449af2e5536b235e264180c9a970980))
- **eslint-plugin-template:** i18n ignoreTags not being ignored properly ([#387](https://github.com/angular-eslint/angular-eslint/issues/387)) ([985f6c2](https://github.com/angular-eslint/angular-eslint/commit/985f6c2e8e70e42223a14fc5bd053732817ff4d9))
- **eslint-plugin-template:** i18n reporting when a parent element already contains i18n id ([#398](https://github.com/angular-eslint/angular-eslint/issues/398)) ([c937a3f](https://github.com/angular-eslint/angular-eslint/commit/c937a3f1d364f74acdb2cc17e507820a784ffb8e))

## [2.0.2](https://github.com/angular-eslint/angular-eslint/compare/v2.0.1...v2.0.2) (2021-03-16)

**Note:** Version bump only for package @angular-eslint/eslint-plugin-template

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

- **eslint-plugin-template:** accessibility-valid-aria not reporting i… ([#278](https://github.com/angular-eslint/angular-eslint/issues/278)) ([391980f](https://github.com/angular-eslint/angular-eslint/commit/391980fd797787560cb56b71c2f741dd48a1c63f))

### Features

- **eslint-plugin-template:** add no duplicate attributes rule ([#302](https://github.com/angular-eslint/angular-eslint/issues/302)) ([c387de5](https://github.com/angular-eslint/angular-eslint/commit/c387de5223f7bb6dfb91a4c6748e307efbf56d9c)), closes [#293](https://github.com/angular-eslint/angular-eslint/issues/293)

# [1.1.0](https://github.com/angular-eslint/angular-eslint/compare/v1.0.0...v1.1.0) (2021-01-14)

### Bug Fixes

- **eslint-plugin-template:** conditional-complexity not reporting all cases ([#279](https://github.com/angular-eslint/angular-eslint/issues/279)) ([a4fd077](https://github.com/angular-eslint/angular-eslint/commit/a4fd077a062797c57f63abd9d0a78f60d40c73ca))

### Features

- **eslint-plugin-template:** accessibility-label-for ([#268](https://github.com/angular-eslint/angular-eslint/issues/268)) ([49ab76a](https://github.com/angular-eslint/angular-eslint/commit/49ab76a9ecaf427ba579093293cb7bc2cfc651c6))
