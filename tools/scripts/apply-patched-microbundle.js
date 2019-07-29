/**
 * microbundle does not currently support providing a custom tsconfig name
 * to the underlying rollup plugin.
 *
 * We need to specify ./tsconfig.build.json as the name, so we just monkey-patch
 * the whole thing for now.
 */
const fs = require('fs');

fs.writeFileSync(
  __dirname + '/../../node_modules/microbundle/dist/microbundle.js',
  fs.readFileSync(__dirname + '/assets/patched-microbundle.js'),
);
