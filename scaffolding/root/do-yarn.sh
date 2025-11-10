#!/bin/bash
set -e

# Ensure corepack is enabled and we're using the right yarn version
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack enable

# Source NVM if available
if [ -s "/usr/local/share/nvm/nvm.sh" ]; then
  . /usr/local/share/nvm/nvm.sh
elif [ -s "${HOME}/.nvm/nvm.sh" ]; then
  . "${HOME}/.nvm/nvm.sh"
fi

# Find all package.json files, excluding node_modules, dist, and hidden directories
PACKAGE_ROOTS=$(find . -type f -name "package.json" ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.*/*")

# Make sure we start with the project root
PROJECT_ROOT=$(pwd -P)

if command -v realpath >/dev/null 2>&1; then
  resolve_path() {
    realpath -m "$1"
  }
else
  resolve_path() {
    local path="$1"
    if [ -z "$path" ]; then
      return 1
    fi

    if [ -d "$path" ]; then
      (cd "$path" 2>/dev/null && pwd -P) || return 1
      return 0
    fi

    local dir
    dir=$(dirname "$path")
    if [ -z "$dir" ] || [ "$dir" = "." ]; then
      dir="$PWD"
    fi

    local base
    base=$(basename "$path")

    (cd "$dir" 2>/dev/null && printf '%s/%s\n' "$(pwd -P)" "$base") || return 1
  }
fi

trim_whitespace() {
  local trimmed="$1"
  trimmed="${trimmed#"${trimmed%%[![:space:]]*}"}"
  trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
  printf '%s' "$trimmed"
}

IGNORE_PATHS=()

add_ignore_path() {
  local candidate="$1"
  [ -n "$candidate" ] || return
  for existing in "${IGNORE_PATHS[@]}"; do
    if [ "$existing" = "$candidate" ]; then
      return
    fi
  done
  IGNORE_PATHS+=("$candidate")
}

while IFS= read -r IGNORE_FILE; do
  [ -n "$IGNORE_FILE" ] || continue
  IGNORE_DIR=$(dirname "$IGNORE_FILE")
  IGNORE_DIR_ABS=$(cd "$IGNORE_DIR" 2>/dev/null && pwd -P)
  [ -n "$IGNORE_DIR_ABS" ] || continue

  while IFS= read -r RAW_PATTERN || [ -n "$RAW_PATTERN" ]; do
    PATTERN=$(trim_whitespace "$RAW_PATTERN")
    [ -n "$PATTERN" ] || continue
    if [ "${PATTERN:0:1}" = "#" ]; then
      continue
    fi

    if [ "${PATTERN:0:1}" = "/" ]; then
      CANDIDATE="$PATTERN"
    else
      CANDIDATE="$IGNORE_DIR_ABS/$PATTERN"
    fi

    if ! RESOLVED=$(resolve_path "$CANDIDATE"); then
      continue
    fi

    RESOLVED="${RESOLVED%/}"
    if [ -f "$RESOLVED" ]; then
      RESOLVED=$(dirname "$RESOLVED")
    fi

    add_ignore_path "$RESOLVED"
  done < "$IGNORE_FILE"
done < <(find . -type f -name ".doyarnignore" ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.*/*" 2>/dev/null)

# Run yarn in the project root using corepack
echo "Running yarn in $PROJECT_ROOT"
#corepack yarn "$@"
NODE_OPTIONS="--max_old_space_size=3072" corepack yarn "$@"

# Loop through each package.json file
for PACKAGE in $PACKAGE_ROOTS; do
  # Get the directory containing the package.json file
  PACKAGE_DIR=$(dirname "$PACKAGE")

  PACKAGE_DIR_ABS=$(resolve_path "$PACKAGE_DIR")
  [ -n "$PACKAGE_DIR_ABS" ] || continue

  # Skip the project root directory
  if [ "$PACKAGE_DIR_ABS" = "$PROJECT_ROOT" ]; then
    continue
  fi

  SKIP_PACKAGE=false
  if [ ${#IGNORE_PATHS[@]} -gt 0 ]; then
    for IGNORE_PATH in "${IGNORE_PATHS[@]}"; do
      [ -n "$IGNORE_PATH" ] || continue
      case "$PACKAGE_DIR_ABS" in
        "$IGNORE_PATH"|"$IGNORE_PATH"/*)
          echo "Skipping yarn in $PACKAGE_DIR (ignored by .doyarnignore)"
          SKIP_PACKAGE=true
          break
          ;;
      esac
    done
  fi

  if [ "$SKIP_PACKAGE" = true ]; then
    continue
  fi

  # Change to the package directory
  cd "$PACKAGE_DIR" || exit

  # Run yarn using corepack
  echo "Running yarn in $PACKAGE_DIR"
  #corepack yarn "$@"
  NODE_OPTIONS="--max_old_space_size=3072" corepack yarn "$@"

  # Return to the project root directory
  cd "$PROJECT_ROOT" || exit
done
