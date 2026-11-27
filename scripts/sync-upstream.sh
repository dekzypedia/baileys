#!/usr/bin/env bash
# Merge the latest WhiskeySockets/Baileys master into this fork.
#
# Docs and license conflicts are resolved in favour of the fork (this repo's README
# is fork-specific); any other conflict aborts the run so a human can resolve it.
#
# Usage: bash scripts/sync-upstream.sh
# Env:   UPSTREAM_URL, UPSTREAM_REF, SYNC_BRANCH
set -euo pipefail

UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/WhiskeySockets/Baileys.git}"
UPSTREAM_REF="${UPSTREAM_REF:-master}"
SYNC_BRANCH="${SYNC_BRANCH:-chore/sync-upstream}"

emit() {
	# surface the result to the GitHub Actions step via GITHUB_OUTPUT
	if [ -n "${GITHUB_OUTPUT:-}" ]; then
		echo "$1" >>"$GITHUB_OUTPUT"
	fi
}

git fetch --no-tags "$UPSTREAM_URL" "$UPSTREAM_REF"
UPSTREAM_SHA=$(git rev-parse FETCH_HEAD)

if git merge-base --is-ancestor "$UPSTREAM_SHA" HEAD; then
	echo "Already up to date with upstream $UPSTREAM_SHA"
	emit "synced=false"
	exit 0
fi

echo "Upstream $UPSTREAM_SHA is $(git rev-list --count "HEAD..$UPSTREAM_SHA") commit(s) ahead"

git checkout -B "$SYNC_BRANCH"

BLOCKING_CONFLICTS=()
if ! git merge --no-ff --no-commit "$UPSTREAM_SHA"; then
	mapfile -t CONFLICTS < <(git diff --name-only --diff-filter=U)
	for file in "${CONFLICTS[@]}"; do
		case "$file" in
			README.md | CHANGELOG.md | LICENSE | .editorconfig | .github/README.md | docs/*)
				# fork-owned docs: keep ours, upstream's wording would drop fork docs
				git checkout --ours -- "$file"
				git add -- "$file"
				;;
			*) BLOCKING_CONFLICTS+=("$file") ;;
		esac
	done

	if [ ${#BLOCKING_CONFLICTS[@]} -gt 0 ]; then
		git merge --abort
		echo "::error::upstream conflicts need a manual merge: ${BLOCKING_CONFLICTS[*]}" >&2
		emit "synced=false"
		exit 1
	fi
fi

if git diff --cached --quiet; then
	# upstream commits are new to git but change nothing this fork does not already have
	git merge --abort 2>/dev/null || git reset --quiet --hard HEAD
	echo "Upstream carries no file changes relative to this fork"
	emit "synced=false"
	exit 0
fi

git -c user.name="github-actions[bot]" \
	-c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
	commit --no-edit

echo "Merged upstream into $SYNC_BRANCH"
emit "synced=true"
