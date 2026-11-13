#!/usr/bin/env bash
#
# Continuum Academy - post-deploy smoke test.
#
# Cheap, unauthenticated checks that the deploy is serving the app and that
# the API correctly rejects anonymous callers. Requires nothing but curl.
#
# Usage:
#   scripts/smoke.sh                        # defaults to http://localhost:3000
#   BASE_URL=https://example.com scripts/smoke.sh
#   scripts/smoke.sh https://example.com    # positional arg wins
#
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-http://localhost:3000}}"
BASE_URL="${BASE_URL%/}"

# Per-request timeout and small retry budget for cold serverless starts.
TIMEOUT="${SMOKE_TIMEOUT:-15}"
RETRIES="${SMOKE_RETRIES:-3}"

attempts=0
failures=0

# status_of <path> -> prints the HTTP status code (000 on network failure).
status_of() {
  local path="$1"
  curl -sS -o /dev/null -w '%{http_code}' \
    --max-time "$TIMEOUT" \
    "${BASE_URL}${path}" || echo '000'
}

# check <expected> <path> <label>
check() {
  local expected="$1" path="$2" label="$3"
  local got='' attempt=1

  while [ "$attempt" -le "$RETRIES" ]; do
    got="$(status_of "$path")"
    if [ "$got" = "$expected" ]; then
      printf '  ok   %-28s %s (%s)\n' "$path" "$got" "$label"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  printf '  FAIL %-28s expected %s, got %s (%s)\n' "$path" "$expected" "$got" "$label"
  return 1
}

echo "Smoke test against ${BASE_URL}"
echo

# ---- API: anonymous callers must be rejected ------------------------------
check 401 /api/auth/session  "session requires auth" || failures=$((failures + 1))
check 401 /api/catalog       "catalog requires auth" || failures=$((failures + 1))
check 401 /api/user/progress "user data requires auth" || failures=$((failures + 1))

# ---- Static app shell: login page must render -----------------------------
check 200 /login/            "login page served" || failures=$((failures + 1))

echo
if [ "$failures" -gt 0 ]; then
  echo "Smoke test FAILED (${failures} check(s))."
  exit 1
fi

echo "Smoke test passed."
