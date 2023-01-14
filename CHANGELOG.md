# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [15.2.0](https://github.com/angular-eslint/angular-eslint/compare/v15.1.0...v15.2.0) (2023-01-14)

### Bug Fixes

- **eslint-plugin:** [component-selector] enhance check for prefix and kebab-case ([#1250](https://github.com/angular-eslint/angular-eslint/issues/1250)) ([16827e4](https://github.com/angular-eslint/angular-eslint/commit/16827e4cfb203de588a4a0b7adf0eadc56542b38))
- **eslint-plugin:** [no-inputs-metadata-property] do not report on directive composition API ([#1248](https://github.com/angular-eslint/angular-eslint/issues/1248)) ([539cf9f](https://github.com/angular-eslint/angular-eslint/commit/539cf9f0cd33eae888cd27087ec9c22379161c93))
- update dependency @angular/compiler to v15.0.2 ([#1245](https://github.com/angular-eslint/angular-eslint/issues/1245)) ([061601f](https://github.com/angular-eslint/angular-eslint/commit/061601fea0c5592592c9e27b0aaeb4a0eadf1419))
- update dependency @angular/compiler to v15.1.0 ([#1252](https://github.com/angular-eslint/angular-eslint/issues/1252)) ([4295c59](https://github.com/angular-eslint/angular-eslint/commit/4295c595c452a48d56caa4571b6964e87ea60fc1))
- update dependency eslint to v8.29.0 ([#1246](https://github.com/angular-eslint/angular-eslint/issues/1246)) ([10c14d2](https://github.com/angular-eslint/angular-eslint/commit/10c14d2e1aaf8185258969226e006a32b3731219))
- update dependency eslint to v8.31.0 ([#1262](https://github.com/angular-eslint/angular-eslint/issues/1262)) ([db89c85](https://github.com/angular-eslint/angular-eslint/commit/db89c85956b583c3f865c8ca8bcd4622b1c2925a))
- update dependency ignore to v5.2.1 ([#1237](https://github.com/angular-eslint/angular-eslint/issues/1237)) ([609e06b](https://github.com/angular-eslint/angular-eslint/commit/609e06b9258c284729a2ff6515e27b3bc9b433a8))
- update dependency ignore to v5.2.4 ([#1263](https://github.com/angular-eslint/angular-eslint/issues/1263)) ([a220e0c](https://github.com/angular-eslint/angular-eslint/commit/a220e0ce051d8b07157e5559a891810a414d7e66))
- update typescript-eslint packages to v5.45.1 ([#1239](https://github.com/angular-eslint/angular-eslint/issues/1239)) ([abb7f79](https://github.com/angular-eslint/angular-eslint/commit/abb7f794b685a57ce696db9624a2ce66f81c6b4b))
- update typescript-eslint packages to v5.48.1 ([#1255](https://github.com/angular-eslint/angular-eslint/issues/1255)) ([11151d1](https://github.com/angular-eslint/angular-eslint/commit/11151d17dc82d04276169e3c898e2aa7f11136b1))
- **utils:** use test case filename when specified ([#1259](https://github.com/angular-eslint/angular-eslint/issues/1259)) ([37bfd14](https://github.com/angular-eslint/angular-eslint/commit/37bfd14cfa14e213c13bad5fe87c057487bac6c3))
- **utils:** use tsconfigRootDir as root dir when specified ([#1260](https://github.com/angular-eslint/angular-eslint/issues/1260)) ([19fe26c](https://github.com/angular-eslint/angular-eslint/commit/19fe26cbad8047567f939e7a6f8b910b42439f54))

### Features

- **eslint-plugin-template:** [i18n] option to require i18n metadata meaning ([#1234](https://github.com/angular-eslint/angular-eslint/issues/1234)) ([4ef0290](https://github.com/angular-eslint/angular-eslint/commit/4ef02902f5216ee8a6fab1faf1798ac559341ffc))
- **eslint-plugin-template:** [no-interpolation-in-attributes] new rule added ([#1242](https://github.com/angular-eslint/angular-eslint/issues/1242)) ([977cb3a](https://github.com/angular-eslint/angular-eslint/commit/977cb3ad623c4d70a0e83b04c0cbe409edf88515))
- **eslint-plugin:** [require-localize-metadata] option to require meaning ([#1235](https://github.com/angular-eslint/angular-eslint/issues/1235)) ([b870123](https://github.com/angular-eslint/angular-eslint/commit/b8701230c14798705be7624af9a03e73792c6f2c))

# [15.1.0](https://github.com/angular-eslint/angular-eslint/compare/v15.0.0...v15.1.0) (2022-11-24)

### Bug Fixes

- **eslint-plugin-template:** [accessibility-valid-aria] use Number() to parse numeric values ([#1218](https://github.com/angular-eslint/angular-eslint/issues/1218)) ([6fe40d6](https://github.com/angular-eslint/angular-eslint/commit/6fe40d672197532176686f1c5c8ab080713334bf))
- **eslint-plugin-template:** [i18n] allow more attributes by default ([#1220](https://github.com/angular-eslint/angular-eslint/issues/1220)) ([4232b1c](https://github.com/angular-eslint/angular-eslint/commit/4232b1c1892189623ead2ccd68fcb6d179186e92))
- **eslint-plugin:** [no-input-rename] do not report on directive composition API ([#1231](https://github.com/angular-eslint/angular-eslint/issues/1231)) ([119fba7](https://github.com/angular-eslint/angular-eslint/commit/119fba7142845f53ccbbad106f5b572b0d13bc9e))
- update dependency @angular/compiler to v15.0.1 ([#1223](https://github.com/angular-eslint/angular-eslint/issues/1223)) ([7b7bd76](https://github.com/angular-eslint/angular-eslint/commit/7b7bd769f0239e43c7c53e714196e02b80453916))
- update typescript-eslint packages to v5.44.0 ([#1222](https://github.com/angular-eslint/angular-eslint/issues/1222)) ([5750e3a](https://github.com/angular-eslint/angular-eslint/commit/5750e3af9c7d9b91f5f4cd2fb524625b215bf4b0))

### Features

- **eslint-plugin-template:** [no-call-expression] add allowList option ([#1217](https://github.com/angular-eslint/angular-eslint/issues/1217)) ([a69c809](https://github.com/angular-eslint/angular-eslint/commit/a69c809cd31f142d2f5aff1c34afeb6e4a607a9c))

# [15.0.0](https://github.com/angular-eslint/angular-eslint/compare/v15.0.0-alpha.5...v15.0.0) (2022-11-20)

As always we recommend that you update your existing workspaces by using `ng update` as we provide some helpful schematics to help migrate your workspaces to the latest and greatest. Running the following will update Angular, the Angular CLI and angular-eslint together:

```sh
ng update @angular/core @angular/cli @angular-eslint/schematics
```

### Bug Fixes

- **schematics:** ensure scoped project names have correct eslint extends ([7b3f736](https://github.com/angular-eslint/angular-eslint/commit/7b3f73670e2935faf7c8fc961d7f8fa50a91208e))

### Features

- bump minimum supported eslint version to 7.20.0 ([56ad69f](https://github.com/angular-eslint/angular-eslint/commit/56ad69f92e5b5789f01d19d0c65e46f4573d9493)), closes [#662](https://github.com/angular-eslint/angular-eslint/issues/662)
- **eslint-plugin:** remove no-conflicting-lifecycle from recommended config ([19dd177](https://github.com/angular-eslint/angular-eslint/commit/19dd177137ceec8b7ab021246a26095f01f25366)), closes [#502](https://github.com/angular-eslint/angular-eslint/issues/502)
- fast linting by default, set eslint and typescript-eslint recommended ([#1212](https://github.com/angular-eslint/angular-eslint/issues/1212)) ([1a53ef9](https://github.com/angular-eslint/angular-eslint/commit/1a53ef985fc1ce6dc7b5e9a797c78b46c48a10ac)), closes [#1174](https://github.com/angular-eslint/angular-eslint/issues/1174)
- **schematics:** ng update migration to preserve v14 parserOptions.project for existing workspaces ([1d45914](https://github.com/angular-eslint/angular-eslint/commit/1d45914097a57bf7fdfc5acc9fab0a66cc01898c))

### BREAKING CHANGES

- Your installed version of ESLint must be version 7.20.0 or later (naturally we recommend the latest v8 of ESLint if possible)
- **eslint-plugin:** no-conflicting-lifecycle is no longer included as part of the recommended config and if you wish to continue using it you will need to enable it yourself in your eslint config rules
- New projects will not include `parserOptions.project` configuration in `.eslintrc.json` files by default, see the new guide here [./docs/RULES_REQUIRING_TYPE_INFORMATION.md](./docs/RULES_REQUIRING_TYPE_INFORMATION.md)

# [14.4.0](https://github.com/angular-eslint/angular-eslint/compare/v14.3.1...v14.4.0) (2022-11-20)

### Features

- **utils:** export template parser services ([#1211](https://github.com/angular-eslint/angular-eslint/issues/1211)) ([34a62d2](https://github.com/angular-eslint/angular-eslint/commit/34a62d25f02716eb0d55f095ce732876a4f7590b))

## [14.3.1](https://github.com/angular-eslint/angular-eslint/compare/v14.3.0...v14.3.1) (2022-11-20)

### Bug Fixes

- **no-input-rename:** allow input aliases that match the directive name applied to an element ([#1207](https://github.com/angular-eslint/angular-eslint/issues/1207)) ([aff3344](https://github.com/angular-eslint/angular-eslint/commit/aff33442e0c35440827f144916e07d180965d0e9))
- update dependency eslint to v8.28.0 ([#1210](https://github.com/angular-eslint/angular-eslint/issues/1210)) ([c671e74](https://github.com/angular-eslint/angular-eslint/commit/c671e7484d4dad81c345d176cfedf01d45b5f820))

# [14.3.0](https://github.com/angular-eslint/angular-eslint/compare/v14.2.0...v14.3.0) (2022-11-17)

### Bug Fixes

- update dependency @angular/compiler to v14.2.11 ([#1202](https://github.com/angular-eslint/angular-eslint/issues/1202)) ([6c1eb81](https://github.com/angular-eslint/angular-eslint/commit/6c1eb81522f199ce101516bc670c975dd2a3cc3a))

### Features

- **eslint-plugin-template:** [accessibility-elements-content] add allowList option ([#1201](https://github.com/angular-eslint/angular-eslint/issues/1201)) ([3877f43](https://github.com/angular-eslint/angular-eslint/commit/3877f4350213d934dc3eac440a2dc6168aeef558))
- **eslint-plugin-template:** [no-inline-styles] add rule ([#1162](https://github.com/angular-eslint/angular-eslint/issues/1162)) ([7e1aadf](https://github.com/angular-eslint/angular-eslint/commit/7e1aadf47913124c09a000e231748c3ea981750b))

# [14.2.0](https://github.com/angular-eslint/angular-eslint/compare/v14.1.2...v14.2.0) (2022-11-15)

### Bug Fixes

- update dependency @angular/compiler to v14.2.10 ([#1165](https://github.com/angular-eslint/angular-eslint/issues/1165)) ([bb4bfe5](https://github.com/angular-eslint/angular-eslint/commit/bb4bfe5482f775be41d93e9ae0b130ee372ad413))
- update dependency @angular/compiler to v14.2.3 ([#1143](https://github.com/angular-eslint/angular-eslint/issues/1143)) ([4eb3e74](https://github.com/angular-eslint/angular-eslint/commit/4eb3e74a85bfa3e8beb9e7ee85c2b3340613375c))
- update dependency aria-query to v5.1.3 ([#1183](https://github.com/angular-eslint/angular-eslint/issues/1183)) ([7c5b299](https://github.com/angular-eslint/angular-eslint/commit/7c5b2993dc9fcc235b869bab63d28766637b3147))
- update dependency axobject-query to v3.1.1 ([#1184](https://github.com/angular-eslint/angular-eslint/issues/1184)) ([dcfd43d](https://github.com/angular-eslint/angular-eslint/commit/dcfd43dfc9ffb4acbe127911ae8e9b1de6210839))
- update dependency eslint to v8.27.0 ([#1189](https://github.com/angular-eslint/angular-eslint/issues/1189)) ([d2ae95a](https://github.com/angular-eslint/angular-eslint/commit/d2ae95a4597ac09103103d7783d4e840d521be3c))
- update dependency eslint-scope to v7 ([#1156](https://github.com/angular-eslint/angular-eslint/issues/1156)) ([05bd9e6](https://github.com/angular-eslint/angular-eslint/commit/05bd9e65f1db3488edb4a359d70307884822ffad))
- update typescript-eslint packages to v5.38.1 ([#1152](https://github.com/angular-eslint/angular-eslint/issues/1152)) ([8f6d0ef](https://github.com/angular-eslint/angular-eslint/commit/8f6d0ef1048eac4113cb3efe53ed466b50aff056))
- update typescript-eslint packages to v5.43.0 ([#1190](https://github.com/angular-eslint/angular-eslint/issues/1190)) ([2a4716a](https://github.com/angular-eslint/angular-eslint/commit/2a4716abd83230c2fe4c3ba377fc4fbe527d7b12))

### Features

- **eslint-plugin-template:** [accessibility-interactive-supports-focus] add rule ([#1134](https://github.com/angular-eslint/angular-eslint/issues/1134)) ([d99d8c1](https://github.com/angular-eslint/angular-eslint/commit/d99d8c1c23ece85c5ee37c3515912e90a335be46))
- **eslint-plugin-template:** [accessibility-role-has-required-aria] add rule ([#1100](https://github.com/angular-eslint/angular-eslint/issues/1100)) ([f684df0](https://github.com/angular-eslint/angular-eslint/commit/f684df040ebdf96b695f07f2e3fa6bfe2310c20e))
- **eslint-plugin-template:** [attributes-order] add rule with fixer ([#1066](https://github.com/angular-eslint/angular-eslint/issues/1066)) ([4c789c7](https://github.com/angular-eslint/angular-eslint/commit/4c789c7546c7306c1a010f78fac4582b0c6efdc0))
- **eslint-plugin-template:** [no-duplicate-attributes] Add option to ignore properties ([#1104](https://github.com/angular-eslint/angular-eslint/issues/1104)) ([018d390](https://github.com/angular-eslint/angular-eslint/commit/018d3906c2569df7dda01fd205e1138aec3f1d0c))
- update dependency eslint to v8.24.0 ([#1148](https://github.com/angular-eslint/angular-eslint/issues/1148)) ([5f30b2d](https://github.com/angular-eslint/angular-eslint/commit/5f30b2d1d930660a5b823e012737c280a668d308))
- update typescript-eslint packages to v5.38.0 ([#1140](https://github.com/angular-eslint/angular-eslint/issues/1140)) ([85b4b47](https://github.com/angular-eslint/angular-eslint/commit/85b4b47acea84ae8f633f348805e22aea36de113))

## [14.1.2](https://github.com/angular-eslint/angular-eslint/compare/v14.1.1...v14.1.2) (2022-09-21)

### Bug Fixes

- **builder:** remove nrwl/devkit from builder implementation ([#1142](https://github.com/angular-eslint/angular-eslint/issues/1142)) ([9d5a7fc](https://github.com/angular-eslint/angular-eslint/commit/9d5a7fc1860a598c62ec163b6363e9436afd81a7))

## [14.1.1](https://github.com/angular-eslint/angular-eslint/compare/v14.1.0...v14.1.1) (2022-09-18)

### Bug Fixes

- **eslint-plugin-template:** [click-events-have-key-events]: handle additional outputs ([#1101](https://github.com/angular-eslint/angular-eslint/issues/1101)) ([c608cdb](https://github.com/angular-eslint/angular-eslint/commit/c608cdbfabb81cfbf542a3c846711853cfcbbfbd))
- **eslint-plugin:** [sort-ngmodule-metadata-arrays]: add intl support ([#1099](https://github.com/angular-eslint/angular-eslint/issues/1099)) ([30d133b](https://github.com/angular-eslint/angular-eslint/commit/30d133bd232c1c9587b2af92d471c919ab02bb4d))

# [14.1.0](https://github.com/angular-eslint/angular-eslint/compare/v14.0.4...v14.1.0) (2022-09-18)

### Features

- update dependency eslint to v8.23.1 ([#1137](https://github.com/angular-eslint/angular-eslint/issues/1137)) ([9c9f28b](https://github.com/angular-eslint/angular-eslint/commit/9c9f28b48300ea4893bc0021cb48404acb75ee1b))
- update typescript-eslint packages to v5.37.0 ([#1138](https://github.com/angular-eslint/angular-eslint/issues/1138)) ([96435a8](https://github.com/angular-eslint/angular-eslint/commit/96435a881f40ca9a124c8f44009a6f656f31e1f2))

## [14.0.4](https://github.com/angular-eslint/angular-eslint/compare/v14.0.3...v14.0.4) (2022-09-08)

### Bug Fixes

- **schematics:** prefer sourceRoot if available for root project ([#1114](https://github.com/angular-eslint/angular-eslint/issues/1114)) ([36c62c3](https://github.com/angular-eslint/angular-eslint/commit/36c62c34098b4cf5b841e577038257b2110bf60a))
- support TS 4.8 with Angular 14.2, update dependencies ([#1123](https://github.com/angular-eslint/angular-eslint/issues/1123)) ([a780b59](https://github.com/angular-eslint/angular-eslint/commit/a780b592b42a61f149ae3d1d0f5c55808cb755df))

## [14.0.3](https://github.com/angular-eslint/angular-eslint/compare/v14.0.2...v14.0.3) (2022-08-23)

### Bug Fixes

- **builder:** ensure package works with Angular 14.1.3 ([#1112](https://github.com/angular-eslint/angular-eslint/issues/1112)) ([b00ef2e](https://github.com/angular-eslint/angular-eslint/commit/b00ef2e0de8d3b541dfa963c4c1901bfa380c4b3))

## [14.0.2](https://github.com/angular-eslint/angular-eslint/compare/v14.0.1...v14.0.2) (2022-07-09)

### Bug Fixes

- **builder:** add explicit dependency on nx ([#1088](https://github.com/angular-eslint/angular-eslint/issues/1088)) ([753a383](https://github.com/angular-eslint/angular-eslint/commit/753a3839a402c4a7f22f6de9ccfa84566c4b7572))

## [14.0.1](https://github.com/angular-eslint/angular-eslint/compare/v14.0.0...v14.0.1) (2022-07-08)

### Bug Fixes

- **builder:** update to latest @nrwl/devkit ([#1082](https://github.com/angular-eslint/angular-eslint/issues/1082)) ([cc00a21](https://github.com/angular-eslint/angular-eslint/commit/cc00a21d99e1e9e48431f066b2942473e99390ec))
- remaining references to master (now main) ([#1083](https://github.com/angular-eslint/angular-eslint/issues/1083)) ([8d36232](https://github.com/angular-eslint/angular-eslint/commit/8d36232435e5e09f870fc42c40327cedd703749f))

# [14.0.0](https://github.com/angular-eslint/angular-eslint/compare/v13.5.0...v14.0.0) (2022-06-23)

As always we recommend that you update your existing workspaces by using `ng update` as we provide some helpful schematics to help migrate your workspaces to the latest and greatest. Running the following will update Angular, the Angular CLI and angular-eslint together:

```sh
ng update @angular/core @angular/cli @angular-eslint/schematics
```

### BREAKING CHANGES

This is a major version bump and comes with some breaking changes, one of which might possibly impact your ESLint configuration if you are targeting inline HTML templates with a very specific glob pattern because the virtual filename has changed (read on to learn more).

- update Angular to v14

  - All packages now require the use of Angular CLI >= 14.0.0 < 15.0.0

- dropped support for Node 12 (in alignment with Angular's own version policy)

- extracted inline HTML templates now contain the original Component filename in their processed virtual filename
  - When ESLint runs on your Component files, if you are using the recommended configuration, it will invoke a processor we have set up to extract the inline HTML templates from your Component declarations. Behind the scenes we give these extracted templates virtual filenames ending in `.html` so that rules targeting HTML files can also target your inline templates.
  - **Before:** In v13 the filename looked like this: `inline-template-${++i}.component.html`, where `i` was an incrementing integer (in case for example you had multiple Component declarations in the same `.ts` file.
  - **Now**: In v14 the filename now looks like this `inline-template-${baseFilename}-${++i}.component.html`, where `i` has the same incrementing integer behavior as before, but we now include the base filename within the virtual filename.
    - E.g. if you have a test file in `projects/foo/src/app/app.spec.ts` which declares a Component with an inline template, the virtual filename generated behind the scene for that template will be `inline-template-app.spec.ts-1.component.html`.
    - This new behavior allows you to use ESLint overrides to apply different behavior to Component inline templates in different files.

### Features

- update eslint to `^8.18.0` (automatically migrated via `ng update`)
- update typescript-eslint to `^5.29.0` (automatically migrated via `ng update`)
- update deprecated `cli.defaultCollection` usage in `angular.json` to use `cli.schematicCollections` instead (automatically migrated via `ng update`)

# [13.5.0](https://github.com/angular-eslint/angular-eslint/compare/v13.4.0...v13.5.0) (2022-06-12)

### Features

- **eslint-plugin-template:** [button-has-type] add rule ([#928](https://github.com/angular-eslint/angular-eslint/issues/928)) ([f19bb30](https://github.com/angular-eslint/angular-eslint/commit/f19bb30bf875eacb3bd82709687e4f6ecd6abac7))

# [13.4.0](https://github.com/angular-eslint/angular-eslint/compare/v13.3.0...v13.4.0) (2022-06-11)

### Features

- update typescript-eslint packages to v5.27.1 ([#1022](https://github.com/angular-eslint/angular-eslint/issues/1022)) ([99e8d4a](https://github.com/angular-eslint/angular-eslint/commit/99e8d4a256b8d2d71ee9b809649cb0846fdadeb9))

# [13.3.0](https://github.com/angular-eslint/angular-eslint/compare/v13.2.1...v13.3.0) (2022-06-10)

### Bug Fixes

- **eslint-plugin-template:** [eqeqeq] update suggest message ([#1000](https://github.com/angular-eslint/angular-eslint/issues/1000)) ([821cb8e](https://github.com/angular-eslint/angular-eslint/commit/821cb8ec0f69beb0cc7d1fb60ad653a1c3c77152))
- **eslint-plugin:** [sort-ngmodule-metadata-arrays] do not sort deps property ([#1001](https://github.com/angular-eslint/angular-eslint/issues/1001)) ([e6d12f2](https://github.com/angular-eslint/angular-eslint/commit/e6d12f21f94aeda5667a32d580b002fc1597cff2))

### Features

- **eslint-plugin-template:** [i18n] add requireDescription option ([#988](https://github.com/angular-eslint/angular-eslint/issues/988)) ([8f55ba8](https://github.com/angular-eslint/angular-eslint/commit/8f55ba832dfe54a4b44334802c3691f839e3ce5d))
- update dependency eslint to v8.17.0 ([#979](https://github.com/angular-eslint/angular-eslint/issues/979)) ([7cabac0](https://github.com/angular-eslint/angular-eslint/commit/7cabac039b895316d6a363cd23765cf7311adf2c))

## [13.2.1](https://github.com/angular-eslint/angular-eslint/compare/v13.2.0...v13.2.1) (2022-04-14)

### Bug Fixes

- **eslint-plugin-template:** false positive conditional complexity in BoundAttribute > Interpolation ([#986](https://github.com/angular-eslint/angular-eslint/issues/986)) ([c3f3120](https://github.com/angular-eslint/angular-eslint/commit/c3f3120b57f7dfe7ff1ff3f3a8791b2cf988e905))
- **template-parser:** suppress parse errors by default, add suppressParseErrors parserOption ([#987](https://github.com/angular-eslint/angular-eslint/issues/987)) ([417bee6](https://github.com/angular-eslint/angular-eslint/commit/417bee66dbae5c55d29966de5ca6e86b52075cb8))

# [13.2.0](https://github.com/angular-eslint/angular-eslint/compare/v13.1.0...v13.2.0) (2022-04-03)

### Bug Fixes

- **schematics:** support more permutations of ng-add ([#970](https://github.com/angular-eslint/angular-eslint/issues/970)) ([0bf549b](https://github.com/angular-eslint/angular-eslint/commit/0bf549b758a6921ff602136d9872e10bb924baf3))

### Features

- **eslint-plugin-template:** add require-localize-metadata rule ([#844](https://github.com/angular-eslint/angular-eslint/issues/844)) ([ca1edf0](https://github.com/angular-eslint/angular-eslint/commit/ca1edf0434b497a7bb756789136499243cee8fe9))
- **parser:** propagate parse errors from angular compiler ([#969](https://github.com/angular-eslint/angular-eslint/issues/969)) ([ab9b496](https://github.com/angular-eslint/angular-eslint/commit/ab9b496095c7194d614394c04548f6848c0d6aff))

# [13.1.0](https://github.com/angular-eslint/angular-eslint/compare/v13.0.1...v13.1.0) (2022-02-13)

### Bug Fixes

- **eslint-plugin-template:** [i18n] do not throw when compiler returns null i18n description ([#892](https://github.com/angular-eslint/angular-eslint/issues/892)) ([d349149](https://github.com/angular-eslint/angular-eslint/commit/d3491492b925bd7855d86f7a1fd90297acaee743))
- rule docs links in create-eslint-rule utils ([#907](https://github.com/angular-eslint/angular-eslint/issues/907)) ([94f6e21](https://github.com/angular-eslint/angular-eslint/commit/94f6e2126088ac300e7a010a45e575cadd4d8e78))
- update dependency ignore to v5.2.0 ([#913](https://github.com/angular-eslint/angular-eslint/issues/913)) ([5480102](https://github.com/angular-eslint/angular-eslint/commit/54801025adcd31b721d293e58884b646de41e2b4))

### Features

- **eslint-plugin-template:** [i18n] add checkDuplicateId option ([#868](https://github.com/angular-eslint/angular-eslint/issues/868)) ([edaf46f](https://github.com/angular-eslint/angular-eslint/commit/edaf46f2f321b9d5a3ba148048b997366e79495d))
- update angular/compiler to v13.2.2 ([#834](https://github.com/angular-eslint/angular-eslint/issues/834)) ([9847978](https://github.com/angular-eslint/angular-eslint/commit/9847978778c3772425d727214f0600a04b6c234c))

## [13.0.1](https://github.com/angular-eslint/angular-eslint/compare/v13.0.0...v13.0.1) (2021-11-19)

### Bug Fixes

- **schematics:** auto update eslint-plugin-import as part of v13 ng update ([#836](https://github.com/angular-eslint/angular-eslint/issues/836)) ([705e83b](https://github.com/angular-eslint/angular-eslint/commit/705e83b6da8e3bf77bbf00305972024f9cffd11b))

# [13.0.0](https://github.com/angular-eslint/angular-eslint/compare/v12.7.0...v13.0.0) (2021-11-18)

Whilst this is a major release of the packages, in this case the major version change is primarily there to signify alignment with v13 of Angular.

You should look to migrate to v13 of all Angular packages, as well as v8 of `eslint` and v5 of `typescript-eslint`.

All of this will be handled for you automatically if you leverage the `ng update` schematics provided by `@angular-eslint`. You can simply include `@angular-eslint/schematics` in your `ng update` command alongside `@angular/cli` and `@angular/core`, for example:

```sh
npx ng update @angular/cli @angular/core @angular-eslint/schematics
```

### Features

- angular-eslint v13 ([#780](https://github.com/angular-eslint/angular-eslint/issues/780)) ([f7ce631](https://github.com/angular-eslint/angular-eslint/commit/f7ce631524dd7834a422a5ac93a4c0534f9f23fa))

# [12.7.0](https://github.com/angular-eslint/angular-eslint/compare/v12.6.1...v12.7.0) (2021-11-18)

### Bug Fixes

- update dependency ignore to v5.1.9 ([#784](https://github.com/angular-eslint/angular-eslint/issues/784)) ([e4574ce](https://github.com/angular-eslint/angular-eslint/commit/e4574ce21d9175f6fc5f27e03a0ca6f81b466a96))

### Features

- **builder:** expose nx executor without ng-compat layer ([#808](https://github.com/angular-eslint/angular-eslint/issues/808)) ([b2cd5d1](https://github.com/angular-eslint/angular-eslint/commit/b2cd5d1756ac466882b953b641fed59a3403421a))
- **i18n:** option to require description for i18n metadata ([#804](https://github.com/angular-eslint/angular-eslint/issues/804)) ([7d072e2](https://github.com/angular-eslint/angular-eslint/commit/7d072e2ec053f388adce00be54c75d8c76373699))
- **schematics:** add package group for ng update ([#807](https://github.com/angular-eslint/angular-eslint/issues/807)) ([ce2e47d](https://github.com/angular-eslint/angular-eslint/commit/ce2e47d50a4814f5cea3e075a0c5a3e8dbbfd44e))

## [12.6.1](https://github.com/angular-eslint/angular-eslint/compare/v12.6.0...v12.6.1) (2021-10-26)

### Bug Fixes

- pin dependencies ([#726](https://github.com/angular-eslint/angular-eslint/issues/726)) ([5c21189](https://github.com/angular-eslint/angular-eslint/commit/5c211898d7a678dbc08f9c9205828ed92b28808d))

# [12.6.0](https://github.com/angular-eslint/angular-eslint/compare/v12.5.0...v12.6.0) (2021-10-25)

### Bug Fixes

- **eslint-plugin:** [sort-ngmodule-metadata-arrays] remove the property restriction ([#694](https://github.com/angular-eslint/angular-eslint/issues/694)) ([440f6dc](https://github.com/angular-eslint/angular-eslint/commit/440f6dcd0d6b330d0af879df1acd306f931e2de1))
- **eslint-plugin:** [sort-ngmodule-metadata-arrays] report the correct node ([#693](https://github.com/angular-eslint/angular-eslint/issues/693)) ([886db08](https://github.com/angular-eslint/angular-eslint/commit/886db08eb0791330c999fdbf022f042613ac127c))
- **eslint-plugin:** more appropriate language for no-attribute-decorator ([#696](https://github.com/angular-eslint/angular-eslint/issues/696)) ([4dde82c](https://github.com/angular-eslint/angular-eslint/commit/4dde82cfeded9727341abea079399a7ef1b9dd9f))
- **eslint-plugin-template:** [i18n] ignore empty strings and non-texts within `BoundText` by default ([#683](https://github.com/angular-eslint/angular-eslint/issues/683)) ([4075643](https://github.com/angular-eslint/angular-eslint/commit/4075643f259c791f1995c207ca14c9c93c3098d6))

### Features

- **bundled-angular-compiler:** create own bundle for `@angular/compiler` ([#720](https://github.com/angular-eslint/angular-eslint/issues/720)) ([0c42299](https://github.com/angular-eslint/angular-eslint/commit/0c422993496bb2670fbd31f55a5fe829704f5112))

# [12.5.0](https://github.com/angular-eslint/angular-eslint/compare/v12.4.1...v12.5.0) (2021-09-20)

### Bug Fixes

- **eslint-plugin-template:** [mouse-events-have-key-events] ignore custom components ([#680](https://github.com/angular-eslint/angular-eslint/issues/680)) ([f65874b](https://github.com/angular-eslint/angular-eslint/commit/f65874b6b1fb012f1f8a1a564b6348cd7ae2117f))
- **eslint-plugin-template:** support escape chars in inline templates ([#691](https://github.com/angular-eslint/angular-eslint/issues/691)) ([8b89ec7](https://github.com/angular-eslint/angular-eslint/commit/8b89ec7ba1ebdd5a29914bac457387d4b65bd691))

### Features

- **utils:** publicly expose utils related to eslint-plugin ([#676](https://github.com/angular-eslint/angular-eslint/issues/676)) ([07711f1](https://github.com/angular-eslint/angular-eslint/commit/07711f14f497d01ab767089742d0b77fa25958c7))

## [12.4.1](https://github.com/angular-eslint/angular-eslint/compare/v12.4.0...v12.4.1) (2021-09-09)

### Bug Fixes

- **utils:** add missing filename option for invalid case utils ([#674](https://github.com/angular-eslint/angular-eslint/issues/674)) ([80b72b3](https://github.com/angular-eslint/angular-eslint/commit/80b72b32fc41f240cbf6962883f20ed4c0f37548))

# [12.4.0](https://github.com/angular-eslint/angular-eslint/compare/v12.3.1...v12.4.0) (2021-09-09)

### Bug Fixes

- **eslint-plugin:** [no-empty-lifecycle-method] incorrect suggestions and correct reports ([#606](https://github.com/angular-eslint/angular-eslint/issues/606)) ([a446e8f](https://github.com/angular-eslint/angular-eslint/commit/a446e8ff521725d354dc23242c4ad23bc52c9681))
- **eslint-plugin:** [sort-ngmodule-metadata-arrays] handle literal metadata and computed properties ([#667](https://github.com/angular-eslint/angular-eslint/issues/667)) ([f993069](https://github.com/angular-eslint/angular-eslint/commit/f99306977254e2894ad769448f0cbebd7665cbcd))
- **eslint-plugin:** properly handle computed literals for some rules ([#600](https://github.com/angular-eslint/angular-eslint/issues/600)) ([fbd6ff7](https://github.com/angular-eslint/angular-eslint/commit/fbd6ff7e5c5e4e249cbb5159c36cac3416e9ae3b))
- **eslint-plugin-template:** [i18n] fixes some incorrect reports ([#665](https://github.com/angular-eslint/angular-eslint/issues/665)) ([a011b9d](https://github.com/angular-eslint/angular-eslint/commit/a011b9d6711482f0713e30208d46b38ce266741d))
- **eslint-plugin-template:** [no-call-expression]: `FunctionCall`s not being reported ([#601](https://github.com/angular-eslint/angular-eslint/issues/601)) ([5552b13](https://github.com/angular-eslint/angular-eslint/commit/5552b13a87ff0a04ea92a12f54decfbb0c4f984e))
- **eslint-plugin-template:** include more checks for `isHiddenFromScreenReader` ([#545](https://github.com/angular-eslint/angular-eslint/issues/545)) ([db2bc05](https://github.com/angular-eslint/angular-eslint/commit/db2bc057458bf7080b7848934dd6a30582dced27))

### Features

- **eslint-plugin:** [prefer-on-push-component-change-detection] add suggestion ([#666](https://github.com/angular-eslint/angular-eslint/issues/666)) ([3723c4c](https://github.com/angular-eslint/angular-eslint/commit/3723c4ca591ba8b62b78717e683ee82e7a5a4b07))
- **eslint-plugin:** [use-injectable-provided-in] add suggestion ([#594](https://github.com/angular-eslint/angular-eslint/issues/594)) ([bdef8c7](https://github.com/angular-eslint/angular-eslint/commit/bdef8c77bcc72aa20c58c2c5c8fd0489675adcfd))
- **utils:** make package public ([#673](https://github.com/angular-eslint/angular-eslint/issues/673)) ([0386082](https://github.com/angular-eslint/angular-eslint/commit/0386082feea5291e7d745ce60a6ee29add486299))

## [12.3.1](https://github.com/angular-eslint/angular-eslint/compare/v12.3.0...v12.3.1) (2021-07-15)

### Bug Fixes

- **eslint-plugin:** handle literal `outputs` properly for [*-output-*] rules ([#595](https://github.com/angular-eslint/angular-eslint/issues/595)) ([8621a62](https://github.com/angular-eslint/angular-eslint/commit/8621a62a5360caac33fd87001e2928d7995a5a01))
- **template-parser:** correct typings for cjs ([#597](https://github.com/angular-eslint/angular-eslint/issues/597)) ([bb60224](https://github.com/angular-eslint/angular-eslint/commit/bb6022410139801dfee062b845c3a2d3f7b8a019))

# [12.3.0](https://github.com/angular-eslint/angular-eslint/compare/v12.2.2...v12.3.0) (2021-07-13)

### Bug Fixes

- **eslint-plugin:** [no-input-prefix] handle alias and `inputs` metadata property ([#582](https://github.com/angular-eslint/angular-eslint/issues/582)) ([675ee11](https://github.com/angular-eslint/angular-eslint/commit/675ee11f541e9e08c87df75a9004a12d0f0403bf))
- **eslint-plugin:** [no-input-rename] handle alias and `inputs` metadata property ([#583](https://github.com/angular-eslint/angular-eslint/issues/583)) ([2883e18](https://github.com/angular-eslint/angular-eslint/commit/2883e185abca4cfd2a7191f5c10742d521f48a89))
- **eslint-plugin:** [use-component-view-encapsulation] handle literal `encapsulation` properly ([#586](https://github.com/angular-eslint/angular-eslint/issues/586)) ([3a9b7f4](https://github.com/angular-eslint/angular-eslint/commit/3a9b7f4056b33918ead342efa331d21b9b1f4309))
- **eslint-plugin:** [use-pipe-transform-interface] handle type imports properly in fix ([#592](https://github.com/angular-eslint/angular-eslint/issues/592)) ([ac3fb12](https://github.com/angular-eslint/angular-eslint/commit/ac3fb126f1171284db6a52775c044aaedef2b90e))

### Features

- **builder:** add noEslintrc option ([#588](https://github.com/angular-eslint/angular-eslint/issues/588)) ([4b150bf](https://github.com/angular-eslint/angular-eslint/commit/4b150bff94d80b22aba2c6e2d170235d5ab71251))
- **builder:** add resolvePluginsRelativeTo option ([#590](https://github.com/angular-eslint/angular-eslint/issues/590)) ([3bea308](https://github.com/angular-eslint/angular-eslint/commit/3bea3085db38d28cfdd4fbc8158ba1b69b42e73d))
- **builder:** add rulesdir option ([#589](https://github.com/angular-eslint/angular-eslint/issues/589)) ([ff9557d](https://github.com/angular-eslint/angular-eslint/commit/ff9557d17e4f9f662f241a3db3ec3744fce1d2dc))
- **builder:** added outputFile option ([#587](https://github.com/angular-eslint/angular-eslint/issues/587)) ([420734b](https://github.com/angular-eslint/angular-eslint/commit/420734b891c61dcbcf2404f03db6251b28e458ac))
- **eslint-plugin:** [component-selector] handle shadow dom components properly ([#559](https://github.com/angular-eslint/angular-eslint/issues/559)) ([ecbe684](https://github.com/angular-eslint/angular-eslint/commit/ecbe68431fb73177d905676fef3df9be9c646636))
- **eslint-plugin:** [no-pipe-impure] add suggestion ([#585](https://github.com/angular-eslint/angular-eslint/issues/585)) ([149bf2f](https://github.com/angular-eslint/angular-eslint/commit/149bf2ffe0af7af1b0fc6b249321b50cf5d9f0a6))
- **schematics:** better support @angular/cli 12.1 ([#591](https://github.com/angular-eslint/angular-eslint/issues/591)) ([c5da07b](https://github.com/angular-eslint/angular-eslint/commit/c5da07b2d0c506dde24f0abc3e212db9deeaca82))

## [12.2.2](https://github.com/angular-eslint/angular-eslint/compare/v12.2.1...v12.2.2) (2021-07-10)

### Bug Fixes

- **eslint-plugin:** [no-output-on-prefix] handle `getters` and `outputs` metadata property ([#566](https://github.com/angular-eslint/angular-eslint/issues/566)) ([5884482](https://github.com/angular-eslint/angular-eslint/commit/588448214c31f01ec78ea892095ff0d05048a8c8))
- **eslint-plugin:** [no-output-rename] handle `getters` and `outputs` metadata property ([#568](https://github.com/angular-eslint/angular-eslint/issues/568)) ([c803ffd](https://github.com/angular-eslint/angular-eslint/commit/c803ffdf020a29939cfd7d763e0206198b4eac72))

## [12.2.1](https://github.com/angular-eslint/angular-eslint/compare/v12.2.0...v12.2.1) (2021-07-10)

### Bug Fixes

- **eslint-plugin:** [no-output-native] handle `getters` and `outputs` metadata property ([#567](https://github.com/angular-eslint/angular-eslint/issues/567)) ([22b378d](https://github.com/angular-eslint/angular-eslint/commit/22b378dd0fa9fe8f50bc0858c98f7f453bc5d389))
- **eslint-plugin:** [no-output-on-prefix] correct false positives ([#525](https://github.com/angular-eslint/angular-eslint/issues/525)) ([3a66274](https://github.com/angular-eslint/angular-eslint/commit/3a662740cd0a15e5d96b9f358505795eeb65a1f7))

# [12.2.0](https://github.com/angular-eslint/angular-eslint/compare/v12.1.0...v12.2.0) (2021-06-20)

### Bug Fixes

- **eslint-plugin:** [no-output-native] correct false positives ([#524](https://github.com/angular-eslint/angular-eslint/issues/524)) ([215abec](https://github.com/angular-eslint/angular-eslint/commit/215abec71cfb8bf276701cc4d7368931d7e3a61c))
- **eslint-plugin-template:** [accessibility-table-scope] ignore custom elements ([#550](https://github.com/angular-eslint/angular-eslint/issues/550)) ([53eb56d](https://github.com/angular-eslint/angular-eslint/commit/53eb56d9baa04acf4c228a7a8c6d3d546556b82b))
- **eslint-plugin-template:** [accessibility-valid-aria] ignore custom elements ([#552](https://github.com/angular-eslint/angular-eslint/issues/552)) ([f6466ec](https://github.com/angular-eslint/angular-eslint/commit/f6466ec2b52b0706e65c52bc02cb96c226e7e533))
- **eslint-plugin-template:** [no-autofocus] ignore custom elements ([#540](https://github.com/angular-eslint/angular-eslint/issues/540)) ([366d9df](https://github.com/angular-eslint/angular-eslint/commit/366d9df21415c82b22f2d9edcbcf53a39c70aa86))
- **eslint-plugin-template:** [no-positive-tabindex] ignore custom elements ([#551](https://github.com/angular-eslint/angular-eslint/issues/551)) ([5e33995](https://github.com/angular-eslint/angular-eslint/commit/5e33995ad7742555a4726b9f612fe5c4db190505))

### Features

- **builder:** add `cacheStrategy` option ([#520](https://github.com/angular-eslint/angular-eslint/issues/520)) ([427a9f5](https://github.com/angular-eslint/angular-eslint/commit/427a9f5505de876bc02aba8296a2d231b1d50fa4))
- **eslint-plugin:** [use-component-view-encapsulation] add suggestion ([#501](https://github.com/angular-eslint/angular-eslint/issues/501)) ([ea9e98d](https://github.com/angular-eslint/angular-eslint/commit/ea9e98d140e6ee237bf5cb46a756ec568b14bd11))
- **eslint-plugin-template:** [no-positive-tabindex] add suggestion ([#541](https://github.com/angular-eslint/angular-eslint/issues/541)) ([0582c2a](https://github.com/angular-eslint/angular-eslint/commit/0582c2a91c50a2f777fa6c2f4bc71252f51b8073))

# [12.1.0](https://github.com/angular-eslint/angular-eslint/compare/v12.0.0...v12.1.0) (2021-05-30)

### Bug Fixes

- **eslint-plugin:** [no-host-metadata-property] correct false positive with `allowStatic` option ([#482](https://github.com/angular-eslint/angular-eslint/issues/482)) ([89926d8](https://github.com/angular-eslint/angular-eslint/commit/89926d80b20b391515d4c400232cbf073c1bea4c))
- **eslint-plugin:** [no-output-on-prefix] not reporting failures on alias ([#471](https://github.com/angular-eslint/angular-eslint/issues/471)) ([f9ba372](https://github.com/angular-eslint/angular-eslint/commit/f9ba37253878183a4bd8363d63442b876486ca61))
- **eslint-plugin:** [relative-url-prefix] valid relative urls being reported ([#456](https://github.com/angular-eslint/angular-eslint/issues/456)) ([2247394](https://github.com/angular-eslint/angular-eslint/commit/2247394cf79aad9db892af5ed6378b93f8e327e6))
- **eslint-plugin-template:** [18n] ignore `checkAttributes` properly ([#467](https://github.com/angular-eslint/angular-eslint/issues/467)) ([20e54d7](https://github.com/angular-eslint/angular-eslint/commit/20e54d7699e499478b79735d2f5f7a4f1d419f21))
- **eslint-plugin-template:** [eqeqeq] change fix to suggest ([#465](https://github.com/angular-eslint/angular-eslint/issues/465)) ([a497fde](https://github.com/angular-eslint/angular-eslint/commit/a497fde0ddab7d6b32dd7b16138b00408258829a))
- **eslint-plugin-template:** [no-negated-async] ignore double-bang ([#450](https://github.com/angular-eslint/angular-eslint/issues/450)) ([9d06488](https://github.com/angular-eslint/angular-eslint/commit/9d064880ec1370e51d93848f7cb4575fd5f078f3))
- **schematics:** skip config for tsconfig.e2e.json when no e2e project is present ([#484](https://github.com/angular-eslint/angular-eslint/issues/484)) ([2673e59](https://github.com/angular-eslint/angular-eslint/commit/2673e59ec5e2708b7082fe7347ee1c96030ab6db))
- **template-parser:** generate correct index.d.ts when building ([#480](https://github.com/angular-eslint/angular-eslint/issues/480)) ([e150044](https://github.com/angular-eslint/angular-eslint/commit/e150044b23496a5af42c335e7635429cb122532d))
- **utils:** support passing `data` and `suggestions` individually for each error ([#491](https://github.com/angular-eslint/angular-eslint/issues/491)) ([70b01bd](https://github.com/angular-eslint/angular-eslint/commit/70b01bd83ddcaf3c57cab0701edb424dabf3a25f))

### Features

- **eslint-plugin:** [no-empty-lifecycle-method] add suggestion ([#463](https://github.com/angular-eslint/angular-eslint/issues/463)) ([1d1a329](https://github.com/angular-eslint/angular-eslint/commit/1d1a32971376f3b0b9cc2fee37896ebad8d25b37))
- **eslint-plugin:** [no-host-metadata-property] add option to allow static values ([#478](https://github.com/angular-eslint/angular-eslint/issues/478)) ([d64c832](https://github.com/angular-eslint/angular-eslint/commit/d64c832d6236fd53c56c67cf7c16b1c56b336aeb))
- **eslint-plugin:** [no-input-rename] add option to allow some inputs ([#475](https://github.com/angular-eslint/angular-eslint/issues/475)) ([9c861dc](https://github.com/angular-eslint/angular-eslint/commit/9c861dc8d016d89675c3bfa1f11bac5865d48b8c))
- **eslint-plugin:** [prefer-output-readonly] add suggestion ([#459](https://github.com/angular-eslint/angular-eslint/issues/459)) ([f3ff789](https://github.com/angular-eslint/angular-eslint/commit/f3ff789bfbfa298af74a8755bbacc81935a4682c))
- **eslint-plugin:** [sort-ngmodule-metadata-arrays] add fixer ([#493](https://github.com/angular-eslint/angular-eslint/issues/493)) ([32fae47](https://github.com/angular-eslint/angular-eslint/commit/32fae47cd3c69540e4a5304b5abe1adb7f3c160e))
- **eslint-plugin-template:** [accessibility-table-scope] add fixer ([#490](https://github.com/angular-eslint/angular-eslint/issues/490)) ([f0c4cea](https://github.com/angular-eslint/angular-eslint/commit/f0c4cea954c0cd3fedbda753c055037806574132))
- **eslint-plugin-template:** [accessibility-valid-aria] add suggestion ([#489](https://github.com/angular-eslint/angular-eslint/issues/489)) ([678e1b5](https://github.com/angular-eslint/angular-eslint/commit/678e1b585734cc080b68a32b633c059b15388a4a))
- **eslint-plugin-template:** [no-any] add suggestion ([#486](https://github.com/angular-eslint/angular-eslint/issues/486)) ([720e869](https://github.com/angular-eslint/angular-eslint/commit/720e869e1389c9d3f1b890e08158f4a58c4b122c))
- **eslint-plugin-template:** [no-autofocus] add fixer ([#485](https://github.com/angular-eslint/angular-eslint/issues/485)) ([9450b7d](https://github.com/angular-eslint/angular-eslint/commit/9450b7da90de0d49bf50d02a6ea3e625582399ab))
- **eslint-plugin-template:** [no-distracting-elements] add fixer ([#488](https://github.com/angular-eslint/angular-eslint/issues/488)) ([9cefe67](https://github.com/angular-eslint/angular-eslint/commit/9cefe6792a58f1d7b2d4dbc6828a1642f8c707da))
- **eslint-plugin-template:** [no-duplicate-attributes] add suggestion ([#495](https://github.com/angular-eslint/angular-eslint/issues/495)) ([62cadcd](https://github.com/angular-eslint/angular-eslint/commit/62cadcd9ebe212bb43495a2926a9785ddb8829fb))
- **eslint-plugin-template:** [no-negated-async] add suggestion ([#487](https://github.com/angular-eslint/angular-eslint/issues/487)) ([0b3f9eb](https://github.com/angular-eslint/angular-eslint/commit/0b3f9eb85b6315e123b4a1c03730929d7202219f))
- **schematics:** on `ng add` include a lint command if none exists ([#481](https://github.com/angular-eslint/angular-eslint/issues/481)) ([ae49af4](https://github.com/angular-eslint/angular-eslint/commit/ae49af4ae8af9fef306bda31e156ed4e5ddf058b))
- **utils:** add support for suggestions ([#458](https://github.com/angular-eslint/angular-eslint/issues/458)) ([0ea02ae](https://github.com/angular-eslint/angular-eslint/commit/0ea02ae3d54137347de33614803cc6fb72759080))

# [12.0.0](https://github.com/angular-eslint/angular-eslint/compare/v4.3.0...v12.0.0) (2021-05-13)

### Bug Fixes

- **template-parser:** add missing `Conditional` and its keys to `VisitorKeys` ([#445](https://github.com/angular-eslint/angular-eslint/issues/445)) ([5ad0f1a](https://github.com/angular-eslint/angular-eslint/commit/5ad0f1aeca244dbd27496e5a2d8c569994a24dcf))
- **eslint-plugin-template:** no-negated-async no longer performs equality checks ([#399](https://github.com/angular-eslint/angular-eslint/issues/399))

### Features

- update tslint-to-eslint-config to 2.4.0 ([7352ad2](https://github.com/angular-eslint/angular-eslint/commit/7352ad260644952abebf06773703f7b550d870fb))
- **eslint-plugin-template:** add rule eqeqeq ([#444](https://github.com/angular-eslint/angular-eslint/issues/444)) ([e15148c](https://github.com/angular-eslint/angular-eslint/commit/e15148cc31d54641815d08f97f14b3388d8dcde2))
- update eslint to ^7.26.0, [@typescript-eslint](https://github.com/typescript-eslint) to 4.23.0 ([9e31c38](https://github.com/angular-eslint/angular-eslint/commit/9e31c3881a13d6ce3b642b9c23c67e2e0f2d1aa1))

### BREAKING CHANGES

- update to angular v12 ([c80008d](https://github.com/angular-eslint/angular-eslint/commit/c80008df8f6b9d08daf3043dffc1be45f8cfbe81))

  - All packages now require the use of Angular CLI >= 12.0.0 < 13

- **eslint-plugin-template:** no-negated-async no longer performs equality checks ([#399](https://github.com/angular-eslint/angular-eslint/issues/399))

  - You should add the new `@angular-eslint/template/eqeqeq` rule to your config if you want to continue with the same functionality around equality checks. This will be applied for you by `ng update` automatically.

# [4.3.0](https://github.com/angular-eslint/angular-eslint/compare/v4.2.1...v4.3.0) (2021-05-12)

### Features

- **eslint-plugin-template:** add rule accessibility-label-has-associated-control ([#392](https://github.com/angular-eslint/angular-eslint/issues/392)) ([0851f3e](https://github.com/angular-eslint/angular-eslint/commit/0851f3eeda54c8c9ad01460b91cf8cf67017f1db))

## [4.2.1](https://github.com/angular-eslint/angular-eslint/compare/v4.2.0...v4.2.1) (2021-05-12)

### Bug Fixes

- **eslint-plugin-template:** no-negated-async message tweak ([#427](https://github.com/angular-eslint/angular-eslint/issues/427)) ([08a8330](https://github.com/angular-eslint/angular-eslint/commit/08a8330003a039c353446724d3e363e670c529e0))

# [4.2.0](https://github.com/angular-eslint/angular-eslint/compare/v4.1.0...v4.2.0) (2021-04-28)

### Features

- **schematics:** add add-eslint-to-project schematic ([#426](https://github.com/angular-eslint/angular-eslint/issues/426)) ([7ae557d](https://github.com/angular-eslint/angular-eslint/commit/7ae557d94f53833fbfbf5128d39f64c7bb1c3c5f))

# [4.1.0](https://github.com/angular-eslint/angular-eslint/compare/v4.0.0...v4.1.0) (2021-04-28)

### Bug Fixes

- **schematics:** support workspaces which use targets alias ([#424](https://github.com/angular-eslint/angular-eslint/issues/424)) ([da6bcf7](https://github.com/angular-eslint/angular-eslint/commit/da6bcf70027cc4b339ef2e825a931ec882d4711f))

### Features

- **schematics:** dynamically install tslint-to-eslint-config as needed ([#425](https://github.com/angular-eslint/angular-eslint/issues/425)) ([27ca474](https://github.com/angular-eslint/angular-eslint/commit/27ca474419defb79b552b233689a2dbf31b8ad92))

# [4.0.0](https://github.com/angular-eslint/angular-eslint/compare/v3.0.1...v4.0.0) (2021-04-18)

We have provided automated migrations for you to move to v4.

All you need to do is run the update schematics for `@angular-eslint`:

```sh
npx ng update @angular-eslint/schematics
```

NOTE: For this release, there are no automated migrations to be run, other than automatically updating the version number of your other `@angular-eslint` packages.

### BREAKING CHANGES

- Passing `--collection=@angular-eslint/schematics` to `ng new` is no longer supported:

  - If you attempt to do it you will get a clear error with instructions on what to do instead.
  - This means we have one consistent way to add `@angular-eslint` to a workspace - run `ng add @angular-eslint/schematics` - regardless of whether that workspace is brand new or has existed for a while.

- We have introduced two new options to the `convert-tslint-to-eslint` schematic:
  - `--remove-tslint-if-no-more-tslint-targets` so that we remove TSLint and Codelyzer from the workspace automatically if we detect you have no TSLint usage remaining (`true` by default).
  - `--ignore-existing-tslint-config` so that we can jump straight to the up to date recommended ESLint setup, without converting the previous Angular CLI TSLint setup, which is unnecessary for brand new projects (`false` by default).

### Features

- **schematics:** options for convert-tslint-to-eslint ([#419](https://github.com/angular-eslint/angular-eslint/issues/419)) ([18fd863](https://github.com/angular-eslint/angular-eslint/commit/18fd863d6948578db96252da57702338a8ea5ea0))

## [3.0.1](https://github.com/angular-eslint/angular-eslint/compare/v3.0.0...v3.0.1) (2021-04-18)

### Bug Fixes

- **eslint-plugin:** correctly expose recommended-extra config ([#418](https://github.com/angular-eslint/angular-eslint/issues/418)) ([f727d8c](https://github.com/angular-eslint/angular-eslint/commit/f727d8c05337908b4e8b9e5f34178bb54a390fb0))

# [3.0.0](https://github.com/angular-eslint/angular-eslint/compare/v2.1.1...v3.0.0) (2021-04-17)

PR #388 (f92b184)

We have provided automated migrations for you to move to v3.

All you need to do is run the update schematics for `@angular-eslint`:

```sh
npx ng update @angular-eslint/schematics
```

---

### BREAKING CHANGES

- The `recommended` configs from `@angular-eslint/eslin-plugin` now only configures rules directly from that plugin. This provides an overall more intuitive experience when stacking the recommended config with other plugins from the ecosystem. If you wish to continue having the same experience (with mixed `@angular-eslint` and `@typescript-eslint` rules in the configs you inherit from you can add the new `recommended--extra` config to your ESLint extends in the relevant config.

E.g. extract from .eslintrc.json

```diff
  "extends": [
    "plugin:@angular-eslint/recommended",
+   "plugin:@angular-eslint/recommended--extra",
  ],
```

- Within the `builder`, linting now always runs relative to your workspace root. This should not have any impact on my workflows but is important if you run `ng lint` from within subdirectories of your workspace.

- Within the `builder`, we always make a call to format, even if the lint results are empty. This is important for non-default formatters.

- We have removed the hard peerDependency on the 3rd party eslint plugins `import` `jsdoc` and `prefer-arrow`. These plugins are only required if you are converted an existing workspace to TSLint and they will still be installed on demand in that scenario.

- Within the `eslint-plugin`, the `component-max-inline-declarations` rule will no longer accept negative values as input. Previously it would silently use the default values in this case. An automated migration is provided for this change as part of the `ng update` schematics.

## [2.1.1](https://github.com/angular-eslint/angular-eslint/compare/v2.1.0...v2.1.1) (2021-04-17)

### Bug Fixes

- **eslint-plugin:** `sort-ngmodule-metadata-arrays` reporting false positives ([#408](https://github.com/angular-eslint/angular-eslint/issues/408)) ([149152a](https://github.com/angular-eslint/angular-eslint/commit/149152a43dfad6ef841fd2784ef3168c0de8d91f))
- **eslint-plugin:** directive-class-suffix reporting selectorless directives ([#394](https://github.com/angular-eslint/angular-eslint/issues/394)) ([42d4e5d](https://github.com/angular-eslint/angular-eslint/commit/42d4e5db9a76703ff8556a4050e785a530a90611))
- **eslint-plugin-template:** [i18n] remove unsafe fix ([#411](https://github.com/angular-eslint/angular-eslint/issues/411)) ([3246b8a](https://github.com/angular-eslint/angular-eslint/commit/3246b8a2e762d70cae5512aed06216e4c0669257))

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
