#!/usr/bin/env bash

VERSION=$1
NPM_REGISTRY=`npm config get registry`

echo

if [[ ! $NPM_REGISTRY == http://localhost* ]]; then
  echo "------------------"
  echo "💣  ERROR 💣 => $NPM_REGISTRY does not look like a local registry - exiting"
  echo "------------------"

  exit 1;
fi

# Change to the root of the monorepo
cd ../../

echo "Publishing to npm registry $NPM_REGISTRY"

echo ""

echo "Running npx lerna version $VERSION --exact --force-publish --no-git-tag-version --no-push --no-changelog --yes"

npx lerna version $VERSION --exact --force-publish --no-git-tag-version --no-push --no-changelog --yes

echo "Publishing all relevant packages to $NPM_REGISTRY"

echo ""

# There is no way for us to publish via lerna while our git working directory is not clean,
# which is the case because of our version bump, so manually publish all the relevant packages for now

cd ./packages/builder
npm publish --registry $NPM_REGISTRY
cd -

cd ./packages/eslint-plugin
npm publish --registry $NPM_REGISTRY
cd -

cd ./packages/eslint-plugin-template
npm publish --registry $NPM_REGISTRY
cd -

cd ./packages/schematics
npm publish --registry $NPM_REGISTRY
cd -

cd ./packages/template-parser
npm publish --registry $NPM_REGISTRY
cd -

cd ./packages/utils
npm publish --registry $NPM_REGISTRY
cd -

echo ""

echo "Publishing complete"
