#!/bin/bash
yes | npm install -g yarn@latest @nrwl/cli nx jest @withgraphite/graphite-cli@stable --force "$@"
if [ ! -z "$GRAPHITE_KEY" ]; then
  npx --yes @withgraphite/graphite-cli@stable auth --token "${GRAPHITE_KEY}"
fi