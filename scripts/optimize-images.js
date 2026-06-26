/**
 * Image Optimization Script
 * Converts all JPEG/PNG images to WebP format, then removes the originals.
 * 
 * Usage: node scripts/optimize-images.js
 * 
 * Output:
 *   original.jpg  → original.webp (full size, quality 75)
 *   (original JPEG is deleted after successful conversion)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const WEBP_QUALITY = 75;

let totalOriginal = 0;
let totalOptimized = 0;
let fileCount = 0;

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  // Skip already-generated responsive files
  const basename = path.basename(filePath, ext);
  if (/\-\d+w$/.test(basename)) return;

  const dir = path.dirname(filePath);
  const stats = fs.statSync(filePath);
  totalOriginal += stats.size;

  try {
    const webpPath = path.join(dir, `${basename}.webp`);

    // Skip if WebP already exists and is newer than source
    if (fs.existsSync(webpPath)) {
      const webpStat = fs.statSync(webpPath);
      if (webpStat.mtimeMs > stats.mtimeMs) {
        // WebP is up-to-date, just delete the original
        fs.unlinkSync(filePath);
        const savedPct = Math.round((1 - webpStat.size / stats.size) * 100);
        console.log(`  ✓ ${basename}${ext} → skipped (WebP exists, ${savedPct}% smaller)`);
        totalOptimized += webpStat.size;
        fileCount++;
        return;
      }
    }

    await sharp(filePath)
      .toFormat('webp', { quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    totalOptimized += webpStats.size;
    fileCount++;

    // Delete original after successful conversion
    fs.unlinkSync(filePath);

    const savedPct = Math.round((1 - webpStats.size / stats.size) * 100);
    console.log(`  ✓ ${basename}${ext} → ${basename}.webp (${savedPct}% smaller)`);
  } catch (err) {
    console.error(`  ✗ Error processing ${filePath}: ${err.message}`);
  }
}

async function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath);
    } else {
      await processImage(fullPath);
    }
  }
}

async function main() {
  console.log('🖼️  Image Optimization Started\n');
  console.log(`Source: ${IMAGES_DIR}\n`);

  await walkDir(IMAGES_DIR);

  const origMB = (totalOriginal / 1024 / 1024).toFixed(2);
  const optMB = (totalOptimized / 1024 / 1024).toFixed(2);
  const savedPct = Math.round((1 - totalOptimized / totalOriginal) * 100);

  console.log(`\n✅ Done!`);
  console.log(`   Files processed: ${fileCount}`);
  console.log(`   Original total:  ${origMB} MB`);
  console.log(`   WebP total:      ${optMB} MB`);
  console.log(`   Space saved:     ${savedPct}%`);
}

main().catch(console.error);
