#!/usr/bin/env bash
# Deploy script for Salsassoc (frontend React + backend API)
# This script builds the React app and prepares the PHP API with Composer,
# then assembles a minimal production-ready tree in ./dist
#
# Usage:
#   ./deploy.sh              # full build (frontend + API)
#   SKIP_FRONTEND=1 ./deploy.sh   # skip React build
#   SKIP_API=1 ./deploy.sh        # skip API preparation
#
# Requirements:
# - Node.js + npm for the React build
# - PHP + Composer for the API dependencies
#
set -euo pipefail

# --- Helpers ---------------------------------------------------------------
log() { printf "\033[1;34m[INFO]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[ERR ]\033[0m %s\n" "$*" 1>&2; }

have_cmd() { command -v "$1" >/dev/null 2>&1; }

copy() {
  # copy SRC... to DEST using rsync if available, else cp -a
  local dest="${@: -1}"  # last arg
  local src=("${@:1:$#-1}")
  if have_cmd rsync; then
    for s in "${src[@]}"; do
      if [ -e "$s" ]; then
        echo "$s" "$dest"
        rsync -a --delete-excluded "$s" "$dest" >/dev/null
      fi
    done
  else
    for s in "${src[@]}"; do
      if [ -e "$s" ]; then
        cp -a "$s" "$dest"
      fi
    done
  fi
}

# --- Paths ----------------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"
FRONTEND_DIR="$ROOT_DIR/ui"
FRONTEND_DIST_DIR="$DIST_DIR"
API_DIR="$ROOT_DIR/api"

# --- Prepare dist ---------------------------------------------------------
log "Cleaning dist folder..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# --- Frontend (React) -----------------------------------------------------
if [ "${SKIP_FRONTEND:-0}" != "1" ]; then
  if [ -f "$FRONTEND_DIR/package.json" ]; then
    log "Building React frontend..."
    if ! have_cmd npm; then
      err "npm is required to build the frontend. Please install Node.js/npm."
      exit 1
    fi

    # Install dependencies for build
    if [ -f "$FRONTEND_DIR/package-lock.json" ]; then
      log "Installing dependencies (npm ci)..."
      (cd "$FRONTEND_DIR" && npm ci --force)
    else
      log "Installing dependencies (npm install)..."
      (cd "$FRONTEND_DIR" && npm install --force)
    fi

    # Build
    log "npm run build..."
    (cd "$FRONTEND_DIR" && npm run build)

    # Assemble minimum required
    mkdir -p "$FRONTEND_DIST_DIR"
    log "Copying frontend artifacts to $FRONTEND_DIST_DIR..."
    # Copy build folder (static files)
    copy "$FRONTEND_DIR/build/" "$FRONTEND_DIST_DIR/"
  else
    warn "No package.json found at frontend root; skipping frontend step."
  fi
else
  warn "Frontend step skipped (SKIP_FRONTEND=1)."
fi

# --- Backend API (PHP + Composer) ----------------------------------------
if [ "${SKIP_API:-0}" != "1" ]; then
  if [ -d "$API_DIR" ]; then
    log "Preparing PHP API (Composer)..."
    if ! have_cmd composer; then
      err "Composer is required to prepare the API. Please install Composer."
      exit 1
    fi

    # Install production dependencies only and optimize autoloader
    (cd "$API_DIR" && composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader)

    mkdir -p "$DIST_DIR/api"

    # Minimum elements: public (entry point), src (code), vendor (deps), composer.* (.env if present)
    log "Copying API files to dist/api..."
    mkdir -p "$DIST_DIR/api"

    copy "$API_DIR/index.php" "$DIST_DIR/index.php"
    # Directories
    [ -d "$API_DIR/public" ] && copy "$API_DIR/public" "$DIST_DIR/api/"
    [ -d "$API_DIR/src" ] && copy "$API_DIR/src" "$DIST_DIR/api/"
    [ -d "$API_DIR/vendor" ] && copy "$API_DIR/vendor" "$DIST_DIR/api/"

    # Copy .env if it exists (otherwise you'll provide it on the server)
    if [ -f "$API_DIR/.env" ]; then
      cp "$API_DIR/.env" "$DIST_DIR/api/.env"
    else
      warn ".env not found in api/. Provide environment variables on the server."
    fi
  else
    warn "api/ directory not found; skipping API step."
  fi
else
  warn "API step skipped (SKIP_API=1)."
fi

log "Done. Deployment package is ready in: $DIST_DIR"
