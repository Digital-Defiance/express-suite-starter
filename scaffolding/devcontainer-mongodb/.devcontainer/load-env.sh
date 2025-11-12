#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Check if we're in a /workspaces or /workspace path
if [[ "${PWD}" =~ ^/workspaces?/ ]]; then
  WORKSPACE=$(echo "${PWD}" | grep -oP '^/workspaces?/[^/]+')
elif [ "$(basename "${PWD}")" = ".devcontainer" ]; then
  WORKSPACE=$(realpath "${PWD}/..")
else
  WORKSPACE=$(realpath "${SCRIPT_DIR}/..")
fi

DEVCONTAINER_DIR="${WORKSPACE}/.devcontainer"

if [ -f "${DEVCONTAINER_DIR}/.env" ]; then
  echo "Loading environment variables from ${DEVCONTAINER_DIR}/.env"
  set -a
  source "${DEVCONTAINER_DIR}/.env"
  set +a
fi