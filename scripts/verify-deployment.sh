#!/bin/bash

# Pre-Deployment Verification Script for Unified-EV
# Run this before deploying to Vercel to catch common issues

set -e

echo "🚀 Unified-EV Pre-Deployment Verification"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=$((FAILED + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo "1. Checking Git Status..."
if git diff-index --quiet HEAD --; then
    check_pass "No uncommitted changes"
else
    check_warn "You have uncommitted changes. Consider committing before deploy."
fi
echo ""

echo "2. Checking Environment Files..."
if [ -f ".env.local" ]; then
    check_pass ".env.local exists"
    
    if grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local; then
        check_pass "Google Maps API key found in .env.local"
    else
        check_fail "Google Maps API key NOT found in .env.local"
    fi
else
    check_fail ".env.local NOT found"
fi

if [ -f ".env.example" ]; then
    check_pass ".env.example exists"
else
    check_warn ".env.example not found (optional but recommended)"
fi

if grep -q ".env.local" .gitignore; then
    check_pass ".env.local is in .gitignore"
else
    check_fail ".env.local is NOT in .gitignore (SECURITY RISK!)"
fi
echo ""

echo "3. Checking Dependencies..."
if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json NOT found"
fi

if [ -d "node_modules" ]; then
    check_pass "node_modules directory exists"
else
    check_warn "node_modules not found. Run: pnpm install"
fi
echo ""

echo "4. Running Build Test..."
if pnpm build > /tmp/build-output.log 2>&1; then
    check_pass "Build successful"
else
    check_fail "Build FAILED. Check /tmp/build-output.log for errors"
    echo "   Run: pnpm build"
fi
echo ""

echo "5. Running Linter..."
if pnpm lint > /tmp/lint-output.log 2>&1; then
    check_pass "Linter passed"
else
    check_warn "Linter warnings/errors found. Check /tmp/lint-output.log"
fi
echo ""

echo "6. Checking Required Files..."
required_files=(
    "next.config.mjs"
    "tsconfig.json"
    "tailwind.config.ts"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file NOT found"
    fi
done
echo ""

echo "7. Checking Data Files..."
data_files=(
    "src/data/stations.json"
    "src/data/routes.json"
    "src/data/vehicles.json"
    "src/data/history.json"
)

for file in "${data_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file exists"
    else
        check_warn "$file not found (may cause runtime errors)"
    fi
done
echo ""

echo "8. Checking Vercel Configuration..."
if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists"
else
    check_warn "vercel.json not found (optional)"
fi
echo ""

echo "=========================================="
echo "Verification Complete!"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Deploy on Vercel: https://vercel.com/new"
    echo "3. Set environment variables in Vercel dashboard"
    echo "4. Wait for build to complete"
    echo ""
    echo "See DOCS/DEPLOYMENT_GUIDE.md for detailed instructions."
    exit 0
else
    echo -e "${RED}✗ Fix the failed checks before deploying!${NC}"
    exit 1
fi
