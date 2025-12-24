#!/usr/bin/env node
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_DIRS = [
  join(__dirname, '../public/images/services'),
  join(__dirname, '../public/images/projects'),
  join(__dirname, '../public/images/icons')
];

async function optimizeImage(filePath) {
  try {
    const stats = await stat(filePath);
    const originalSize = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`Optimizing ${filePath} (${originalSize}MB)...`);
    
    await sharp(filePath)
      .resize(1920, null, { // Max width 1920px, maintain aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80, effort: 6 })
      .toFile(filePath + '.tmp');
    
    // Replace original with optimized
    const { rename, unlink } = await import('fs/promises');
    await unlink(filePath);
    await rename(filePath + '.tmp', filePath);
    
    const newStats = await stat(filePath);
    const newSize = (newStats.size / 1024 / 1024).toFixed(2);
    const saved = ((stats.size - newStats.size) / 1024 / 1024).toFixed(2);
    
    console.log(`✓ Done: ${newSize}MB (saved ${saved}MB)`);
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error.message);
  }
}

async function main() {
  for (const dir of IMAGE_DIRS) {
    console.log(`\nOptimizing images in ${dir}...\n`);
    const files = await readdir(dir);
    const images = files.filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    
    console.log(`Found ${images.length} images\n`);
    
    for (const file of images) {
      await optimizeImage(join(dir, file));
    }
  }
  
  console.log('\n✅ All images optimized!');
}

main();
