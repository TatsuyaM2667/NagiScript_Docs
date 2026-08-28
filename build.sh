#!/bin/bash
# NagiScript Docs — Site Builder & Cloudflare Pages Deployer
# Builds WASM components and deploys to Cloudflare Pages

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== NagiScript Docs Builder ==="
echo ""

# Step 1: Compile WASM modules
echo "[1/5] Compiling NagiScript WASM modules..."
if command -v nagiscript &>/dev/null; then
    nagiscript wasm nagiscript/playground.ngs -o nagiscript/playground 2>&1
    echo "  -> nagiscript/playground.wasm"
    nagiscript wasm nagiscript/site-stats.ngs -o nagiscript/site-stats 2>&1
    echo "  -> nagiscript/site-stats.wasm"
else
    echo "  SKIP: nagiscript not found"
fi

# Step 2: Generate TypeScript definitions
echo "[2/5] Generating TypeScript definitions..."
if command -v nagiscript &>/dev/null; then
    nagiscript dts nagiscript/playground.ngs -o nagiscript/playground.d.ts 2>&1 || true
    nagiscript dts nagiscript/site-stats.ngs -o nagiscript/site-stats.d.ts 2>&1 || true
    echo "  -> nagiscript/*.d.ts"
fi

# Step 3: Validate site structure
echo "[3/5] Validating site structure..."
ERRORS=0
for f in index.html css/style.css js/main.js _headers _routes.json wrangler.jsonc; do
    if [ ! -f "$f" ]; then
        echo "  MISSING: $f"
        ERRORS=$((ERRORS + 1))
    fi
done

HTML_COUNT=$(find docs -name "*.html" | wc -l)
echo "  Pages: $HTML_COUNT HTML"

if [ "$ERRORS" -gt 0 ]; then
    echo "=== Build Failed ==="
    exit 1
fi

# Step 4: Deploy to Cloudflare Pages
echo "[4/5] Deploying to Cloudflare Pages..."
if command -v wrangler &>/dev/null; then
    echo "  Project: nagiscript-docs"
    echo "  Output dir: ."
    echo ""
    wrangler pages deploy . --project-name=nagiscript-docs --commit-dirty=true
    echo ""
    echo "  Deployed to: https://nagiscript-docs.pages.dev"
else
    echo "  SKIP: wrangler not found"
    echo "  Install: npm install -g wrangler"
fi

# Step 5: Summary
echo ""
echo "[5/5] Summary"
echo "=== Build Complete ==="
echo ""
echo "Site structure:"
echo "  index.html           — Landing page"
echo "  css/style.css        — Stylesheet (dark/light theme)"
echo "  js/main.js           — Navigation, syntax highlighting"
echo "  docs/                — Documentation ($HTML_COUNT pages)"
echo "  nagiscript/          — WASM components"
echo "  _headers             — Cloudflare Pages headers"
echo "  _routes.json         — Cloudflare Pages routes"
echo "  wrangler.jsonc       — Cloudflare Pages config"
echo ""
echo "To deploy manually:"
echo "  wrangler pages deploy . --project-name=nagiscript-docs"
echo ""
echo "To preview locally:"
echo "  npx wrangler pages dev ."
