# We intentionally keep the integration test fixtures outside of the lerna's view of packages.
# This helps save time in the common case of not working directly on the integration tests, and
# also makes sure we do not run into issues with polluting the node_modules of the main monorepo.
#
# Use the local versions of packages in the fixtures so that we are always testing the latest
#
# NOTE: You need to rerun this script every time the local packages change
# in order to apply the changes to the node_modules of the repo under test
npm install $(npm pack ../../../builder | tail -1)
npm install $(npm pack ../../../eslint-plugin | tail -1)
npm install $(npm pack ../../../eslint-plugin-template | tail -1)
npm install $(npm pack ../../../template-parser | tail -1)

npm install
