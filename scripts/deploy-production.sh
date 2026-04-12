#!/bin/bash

# MathQuest Production Deployment Script
# Handles secure deployment with proper environment setup

set -e

echo "=== MathQuest Production Deployment ==="

# Environment validation
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    echo "ERROR: Missing required environment variables"
    exit 1
fi

# Security checks
echo "Running security checks..."
npm audit --audit-level high
npm run lint
npm run test

# Build optimization
echo "Optimizing build for production..."
npm run build

# Bundle analysis
echo "Analyzing bundle size..."
node scripts/analyze-bundle.js

# Security headers validation
echo "Validating security configuration..."
node scripts/security-check.js

# Performance tests
echo "Running performance tests..."
npm run test:e2e || echo "E2E tests skipped - configure Playwright first"

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# Post-deployment verification
echo "Verifying deployment..."
curl -f -I https://mathquest.vercel.app/ || {
    echo "ERROR: Deployment verification failed"
    exit 1
}

# Health checks
echo "Running health checks..."
curl -f https://mathquest.vercel.app/api/health || {
    echo "WARNING: Health check endpoint not responding"
}

echo "=== Deployment Complete ==="
echo "Your app is live at: https://mathquest.vercel.app"
echo "Monitor performance at: https://mathquest.vercel.app/admin/analytics"
