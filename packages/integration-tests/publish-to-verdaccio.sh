#!/usr/bin/env bash

set -e

# Change to the root of the monorepo
cd ../../

VERSION=$1
NPM_REGISTRY=$(npm config get registry)

if [[ ! $NPM_REGISTRY == http://localhost* ]]; then
  echo "------------------"
  echo "💣  ERROR 💣 => $NPM_REGISTRY does not look like a local registry - exiting"
  echo "------------------"

  exit 1;
fi

echo "Publishing to npm registry $NPM_REGISTRY"

echo ""

echo "Running yarn nx release version $VERSION"

echo ""

yarn nx release version $VERSION

echo ""

echo "Publishing all relevant packages to $NPM_REGISTRY"

echo ""

yarn nx release publish --registry=$NPM_REGISTRY

echo ""

echo "Publishing complete"