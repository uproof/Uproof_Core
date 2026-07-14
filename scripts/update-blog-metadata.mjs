#!/usr/bin/env node

/**
 * Update blog-metadata.json from blog.json
 * 
 * Usage: npm run update-metadata
 * 
 * This script extracts metadata (title, excerpt, date, etc.) from blog.json
 * and generates blog-metadata.json for use in blog list pages and sitemaps.
 * 
 * Run this after updating blog.json via the API or manual edits.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogPath = path.join(__dirname, '../data/blog.json');
const metadataPath = path.join(__dirname, '../data/blog-metadata.json');

async function updateMetadata() {
  try {
    console.log('📖 Reading blog.json...');
    const blogContent = await fs.readFile(blogPath, 'utf8');
    const blog = JSON.parse(blogContent);

    console.log(`Found ${blog.length} blog posts`);

    // Extract metadata (without content field)
    const metadata = blog.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: post.date,
      category: post.category,
      readTime: post.readTime,
      status: post.status,
      image: post.image,
    }));

    // Write metadata file
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Calculate reduction
    const blogSize = blogContent.length;
    const metadataContent = JSON.stringify(metadata, null, 2);
    const metadataSize = metadataContent.length;
    const reduction = Math.round(((blogSize - metadataSize) / blogSize) * 100);

    console.log(`✅ blog-metadata.json updated`);
    console.log(`   blog.json: ${(blogSize / 1024).toFixed(1)} KB`);
    console.log(`   blog-metadata.json: ${(metadataSize / 1024).toFixed(1)} KB`);
    console.log(`   Reduction: ${reduction}%`);
    console.log('\n💡 Tip: Run `npm run build` to regenerate static pages with fresh metadata.');
  } catch (error) {
    console.error('❌ Error updating metadata:', error.message);
    process.exit(1);
  }
}

updateMetadata();
