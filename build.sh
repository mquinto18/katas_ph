#!/bin/bash
set -e

# Run the Vercel build step
npx vercel build

# @cloudflare/next-on-pages v1.13.x has an ordering bug: it checks whether
# /_error.func is also invalid before deciding to auto-fix /_not-found.func.
# Because /_error.func hasn't been processed yet at that point, both stay in
# invalidFunctions and the build fails. Removing the not-found function
# directories here lets the tool skip that broken code path entirely, while
# the statically pre-rendered 404 HTML still serves the page correctly.
rm -rf .vercel/output/functions/_not-found.func
rm -rf .vercel/output/functions/_not-found.rsc.func

# Process the Vercel output for Cloudflare Pages (build already done above)
npx @cloudflare/next-on-pages --skip-build
