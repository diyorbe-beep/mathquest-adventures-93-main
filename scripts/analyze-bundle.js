#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the production bundle for size optimization opportunities
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get bundle stats from Vite build
const getBundleStats = () => {
  try {
    const statsPath = join(__dirname, '../dist/.vite/manifest.json');
    const manifest = JSON.parse(readFileSync(statsPath, 'utf8'));
    
    const stats = {
      totalSize: 0,
      chunks: [],
      dependencies: new Map()
    };

    for (const [fileName, chunk] of Object.entries(manifest)) {
      if (fileName.endsWith('.js')) {
        const chunkPath = join(__dirname, '../dist', fileName);
        const size = readFileSync(chunkPath).length;
        
        stats.totalSize += size;
        stats.chunks.push({
          name: fileName,
          size,
          sizeFormatted: formatBytes(size),
          imports: chunk.imports || []
        });

        // Track dependencies
        if (chunk.imports) {
          chunk.imports.forEach(dep => {
            const current = stats.dependencies.get(dep) || 0;
            stats.dependencies.set(dep, current + size);
          });
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('Could not read bundle stats:', error.message);
    return null;
  }
};

// Format bytes to human readable format
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Analyze bundle for optimization opportunities
const analyzeOptimizations = (stats) => {
  const recommendations = [];

  // Check for large chunks
  const largeChunks = stats.chunks.filter(chunk => chunk.size > 500000); // 500KB
  if (largeChunks.length > 0) {
    recommendations.push({
      type: 'large-chunks',
      message: 'Consider splitting large chunks',
      chunks: largeChunks.map(c => `${c.name} (${c.sizeFormatted})`)
    });
  }

  // Check for duplicate dependencies
  const duplicateDeps = [];
  const depCounts = new Map();
  
  stats.chunks.forEach(chunk => {
    chunk.imports.forEach(dep => {
      const count = depCounts.get(dep) || 0;
      depCounts.set(dep, count + 1);
    });
  });

  depCounts.forEach((count, dep) => {
    if (count > 3) {
      duplicateDeps.push(`${dep} (used in ${count} chunks)`);
    }
  });

  if (duplicateDeps.length > 0) {
    recommendations.push({
      type: 'duplicate-deps',
      message: 'Consider deduplicating dependencies',
      dependencies: duplicateDeps
    });
  }

  // Check total bundle size
  if (stats.totalSize > 3000000) { // 3MB
    recommendations.push({
      type: 'bundle-size',
      message: 'Bundle is large, consider code splitting',
      size: formatBytes(stats.totalSize)
    });
  }

  return recommendations;
};

// Generate optimization report
const generateReport = (stats) => {
  console.log('\n=== MathQuest Bundle Analysis ===\n');
  
  console.log(`Total Bundle Size: ${formatBytes(stats.totalSize)}`);
  console.log(`Total Chunks: ${stats.chunks.length}\n`);

  console.log('--- Chunk Breakdown ---');
  stats.chunks
    .sort((a, b) => b.size - a.size)
    .forEach(chunk => {
      console.log(`${chunk.name}: ${chunk.sizeFormatted}`);
      if (chunk.imports.length > 0) {
        console.log(`  Imports: ${chunk.imports.join(', ')}`);
      }
    });

  console.log('\n--- Optimization Recommendations ---');
  const recommendations = analyzeOptimizations(stats);
  
  if (recommendations.length === 0) {
    console.log('No major optimization opportunities found! Bundle looks good.');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.message}`);
      
      if (rec.type === 'large-chunks') {
        rec.chunks.forEach(chunk => console.log(`   - ${chunk}`));
      } else if (rec.type === 'duplicate-deps') {
        rec.dependencies.forEach(dep => console.log(`   - ${dep}`));
      } else if (rec.type === 'bundle-size') {
        console.log(`   Current size: ${rec.size}`);
      }
    });
  }

  console.log('\n--- Performance Tips ---');
  console.log('1. Use dynamic imports for rarely used components');
  console.log('2. Implement lazy loading for routes');
  console.log('3. Consider tree-shaking for large libraries');
  console.log('4. Use CDN for popular libraries');
  console.log('5. Enable compression on your server');
};

// Main execution
const main = () => {
  const stats = getBundleStats();
  
  if (!stats) {
    console.error('Failed to analyze bundle. Make sure to run `npm run build` first.');
    process.exit(1);
  }

  generateReport(stats);

  // Exit with appropriate code
  const recommendations = analyzeOptimizations(stats);
  process.exit(recommendations.length > 0 ? 1 : 0);
};

main();
