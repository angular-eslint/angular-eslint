# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [12.3.1](https://github.com/angular-eslint/angular-eslint/compare/v12.3.0...v12.3.1) (2021-07-15)

### Bug Fixes

- **eslint-plugin:** handle literal `outputs` properly for [*-output-*] rules ([#595](https://github.com/angular-eslint/angular-eslint/issues/595)) ([8621a62](https://github.com/angular-eslint/angular-eslint/commit/8621a62a5360caac33fd87001e2928d7995a5a01))

# [12.3.0](https://github.com/angular-eslint/angular-eslint/compare/v12.2.2...v12.3.0) (2021-07-13)

### Bug Fixes

- **eslint-plugin:** [no-input-prefix] handle alias and `inputs` metadata property ([#582](https://github.com/angular-eslint/angular-eslint/issues/582)) ([675ee11](https://github.com/angular-eslint/angular-eslint/commit/675ee11f541e9e08c87df75a9004a12d0f0403bf))
- **eslint-plugin:** [no-input-rename] handle alias and `inputs` metadata property ([#583](https://github.com/angular-eslint/angular-eslint/issues/583)) ([2883e18](https://github.com/angular-eslint/angular-eslint/commit/2883e185abca4cfd2a7191f5c10742d521f48a89))
- **eslint-plugin:** [use-component-view-encapsulation] handle literal `encapsulation` properly ([#586](https://github.com/angular-eslint/angular-eslint/issues/586)) ([3a9b7f4](https://github.com/angular-eslint/angular-eslint/commit/3a9b7f4056b33918ead342efa331d21b9b1f4309))
- **eslint-plugin:** [use-pipe-transform-interface] handle type imports properly in fix ([#592](https://github.com/angular-eslint/angular-eslint/issues/592)) ([ac3fb12](https://github.com/angular-eslint/angular-eslint/commit/ac3fb126f1171284db6a52775c044aaedef2b90e))

### Features

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

### Features

- **eslint-plugin:** [use-component-view-encapsulation] add suggestion ([#501](https://github.com/angular-eslint/angular-eslint/issues/501)) ([ea9e98d](https://github.com/angular-eslint/angular-eslint/commit/ea9e98d140e6ee237bf5cb46a756ec568b14bd11))

# [12.1.0](https://github.com/angular-eslint/angular-eslint/compare/v12.0.0...v12.1.0) (2021-05-30)

### Bug Fixes

- **eslint-plugin:** [no-host-metadata-property] correct false positive with `allowStatic` option ([#482](https://github.com/angular-eslint/angular-eslint/issues/482)) ([89926d8](https://github.com/angular-eslint/angular-eslint/commit/89926d80b20b391515d4c400232cbf073c1bea4c))
- **eslint-plugin:** [no-output-on-prefix] not reporting failures on alias ([#471](https://github.com/angular-eslint/angular-eslint/issues/471)) ([f9ba372](https://github.com/angular-eslint/angular-eslint/commit/f9ba37253878183a4bd8363d63442b876486ca61))
- **eslint-plugin:** [relative-url-prefix] valid relative urls being reported ([#456](https://github.com/angular-eslint/angular-eslint/issues/456)) ([2247394](https://github.com/angular-eslint/angular-eslint/commit/2247394cf79aad9db892af5ed6378b93f8e327e6))
- **utils:** support passing `data` and `suggestions` individually for each error ([#491](https://github.com/angular-eslint/angular-eslint/issues/491)) ([70b01bd](https://github.com/angular-eslint/angular-eslint/commit/70b01bd83ddcaf3c57cab0701edb424dabf3a25f))

### Features

- **eslint-plugin:** [no-empty-lifecycle-method] add suggestion ([#463](https://github.com/angular-eslint/angular-eslint/issues/463)) ([1d1a329](https://github.com/angular-eslint/angular-eslint/commit/1d1a32971376f3b0b9cc2fee37896ebad8d25b37))
- **eslint-plugin:** [no-host-metadata-property] add option to allow static values ([#478](https://github.com/angular-eslint/angular-eslint/issues/478)) ([d64c832](https://github.com/angular-eslint/angular-eslint/commit/d64c832d6236fd53c56c67cf7c16b1c56b336aeb))
- **eslint-plugin:** [no-input-rename] add option to allow some inputs ([#475](https://github.com/angular-eslint/angular-eslint/issues/475)) ([9c861dc](https://github.com/angular-eslint/angular-eslint/commit/9c861dc8d016d89675c3bfa1f11bac5865d48b8c))
- **eslint-plugin:** [prefer-output-readonly] add suggestion ([#459](https://github.com/angular-eslint/angular-eslint/issues/459)) ([f3ff789](https://github.com/angular-eslint/angular-eslint/commit/f3ff789bfbfa298af74a8755bbacc81935a4682c))
- **eslint-plugin:** [sort-ngmodule-metadata-arrays] add fixer ([#493](https://github.com/angular-eslint/angular-eslint/issues/493)) ([32fae47](https://github.com/angular-eslint/angular-eslint/commit/32fae47cd3c69540e4a5304b5abe1adb7f3c160e))

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
