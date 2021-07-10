# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
