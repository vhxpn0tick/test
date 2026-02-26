const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Config
const imagesDir = path.join(__dirname, '..', 'assets', 'images');
const sizes = [320, 640, 1200];
const formats = ['webp', 'avif'];

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  const inputPath = path.join(imagesDir, file);

  // Only process banners and thumbs
  if (!base.endsWith('-banner') && !base.endsWith('-thumb')) return;

  for (const size of sizes) {
    for (const fmt of formats) {
      const outName = `${base}-${size}.${fmt}`;
      const outPath = path.join(imagesDir, outName);
      try {
        await sharp(inputPath)
          .resize({ width: size })
          [fmt]({ quality: 80 })
          .toFile(outPath);
        console.log('wrote', outPath);
      } catch (err) {
        console.error('failed', outPath, err.message);
      }
    }
  }
}

async function main() {
  if (!fs.existsSync(imagesDir)) {
    console.error('images directory not found:', imagesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir);
  const promises = files.map(f => processFile(f));
  await Promise.all(promises);
  console.log('done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
