// eslint-disable-next-line @typescript-eslint/no-var-requires
const nxPreset = require('@nrwl/jest/preset');

module.exports = {
  ...nxPreset,
  // The jest preset will attempt to transform .js/.mjs files, but we don't want that here
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.m?js$',
    '[/\\\\]packages[/\\\\].+\\.m?js$',
  ],
};
