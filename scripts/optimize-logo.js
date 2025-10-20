import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function main() {
  const projectRoot = path.resolve(process.cwd(), '..');
  const srcLogo = path.join(process.cwd(), 'src', 'assets', 'logo.png');
  const outLogo = path.join(process.cwd(), 'src', 'assets', 'logo.webp');

  if (!fs.existsSync(srcLogo)) {
    console.error('Source logo not found:', srcLogo);
    process.exit(1);
  }

  try {
    await sharp(srcLogo).resize({ width: 1200 }).webp({ quality: 80 }).toFile(outLogo);
    console.log('Wrote optimized logo to', outLogo);
  } catch (err) {
    console.error('Failed to optimize logo:', err);
    process.exit(1);
  }
}

main();
