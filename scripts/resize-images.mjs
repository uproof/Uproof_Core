/**
 * Resize oversized images for better web performance.
 *
 * Icons  (Solutions section): displayed at ~430×320 max → resize to 640 width
 * Services images: displayed at ~640×480 max → resize to 960 width
 */
import sharp from 'sharp';
import { readdirSync, mkdirSync, copyFileSync, unlinkSync, renameSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;

const ICON_DIR = join(ROOT, 'public/images/icons');
const SERVICE_DIR = join(ROOT, 'public/images/services');
const BACKUP_DIR = join(ROOT, 'public/images/_backup');

const ICON_MAX_WIDTH = 640;
const SERVICE_MAX_WIDTH = 960;
const WEBP_QUALITY = 80;

async function resizeDir(dir, maxWidth, label) {
  const files = readdirSync(dir).filter(f => /\.(webp|jpe?g|png)$/i.test(f));

  for (const file of files) {
    const safeFile = file.includes('/') || file.includes('\\') ? '' : file;
    if (!safeFile) {
      console.warn(`  SKIP unsafe filename ${file}`);
      continue;
    }

    const src = `${dir}/${safeFile}`;
    const buf = await sharp(src).metadata();

    if (buf.width <= maxWidth) {
      console.log(`  SKIP ${file} (${buf.width}x${buf.height} — already <= ${maxWidth}px)`);
      continue;
    }

    const oldSize = statSync(src).size;

    // Back up original
    const backupLabel = `${BACKUP_DIR}/${label}`;
    mkdirSync(backupLabel, { recursive: true });
    copyFileSync(src, `${backupLabel}/${safeFile}`);

    const tmpPath = src + '.tmp.webp';

    // Read buffer, resize, write to new file
    await sharp(src)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(tmpPath);

    // Replace original with resized version
    unlinkSync(src);
    renameSync(tmpPath, src);

    const newMeta = await sharp(src).metadata();
    const newSize = statSync(src).size;
    const oldKB = Math.round(oldSize / 1024);
    const newKB = Math.round(newSize / 1024);
    console.log(`  OK ${file}: ${buf.width}x${buf.height} (${oldKB} KB) -> ${newMeta.width}x${newMeta.height} (${newKB} KB)  saved ${oldKB - newKB} KB`);
  }
}

console.log('\n-- Resizing icon images --');
await resizeDir(ICON_DIR, ICON_MAX_WIDTH, 'icons');

console.log('\n-- Resizing service images --');
await resizeDir(SERVICE_DIR, SERVICE_MAX_WIDTH, 'services');

console.log('\nDone. Originals backed up to public/images/_backup/\n');
