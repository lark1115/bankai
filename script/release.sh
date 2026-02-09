#!/usr/bin/env bash
set -euo pipefail

# Release script for bankai-cli
# Usage: ./script/release.sh [patch|minor|major]
#
# Flow: bump version on develop → push → merge to main → CI auto-publishes

BUMP_TYPE="${1:-patch}"

if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

# Ensure we're on develop
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "develop" ]]; then
  echo "Error: Must be on develop branch (currently on $BRANCH)"
  exit 1
fi

# Ensure clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: Working tree is not clean"
  exit 1
fi

# Pull latest
echo "Pulling latest develop..."
git pull --rebase origin develop

# Run checks
echo "Running checks..."
bun install
bun run build
bun run test

# Bump version
CURRENT=$(node -p "require('./package.json').version")
NEW=$(node -e "
  const [major, minor, patch] = '$CURRENT'.split('.').map(Number);
  const type = '$BUMP_TYPE';
  if (type === 'major') console.log(\`\${major+1}.0.0\`);
  else if (type === 'minor') console.log(\`\${major}.\${minor+1}.0\`);
  else console.log(\`\${major}.\${minor}.\${patch+1}\`);
")

echo "Bumping version: $CURRENT → $NEW ($BUMP_TYPE)"

# Update package.json version
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$NEW';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Commit and push
git add package.json
git commit -m "Bump version to $NEW"
git push origin develop

# Merge develop → main
echo "Merging develop → main..."
git checkout main
git pull --rebase origin main
git merge develop --no-edit
git push origin main

# Switch back to develop
git checkout develop

echo ""
echo "Done! v$NEW will be published by CI auto-release."
echo "Watch: https://github.com/lark1115/bankai/actions"
