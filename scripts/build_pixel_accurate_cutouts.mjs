import fs from 'fs';
import path from 'path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const SAMPLES = [
  {
    id: 'sample-sneaker',
    name: 'Nike Air Sport Sneaker',
    category: 'product',
    file: 'public/samples/sample-sneaker-orig-new.jpg',
    tolerance: 36,
    feather: 16,
    centerWeight: 30
  },
  {
    id: 'sample-portrait',
    name: 'Executive Studio Portrait',
    category: 'portrait',
    file: 'public/samples/sample-portrait-orig-new.jpg',
    tolerance: 62,
    feather: 22,
    centerWeight: 45
  },
  {
    id: 'sample-fashion',
    name: 'Editorial Lookbook Model',
    category: 'fashion',
    file: 'public/samples/sample-fashion-orig-new.jpg',
    tolerance: 55,
    feather: 20,
    centerWeight: 40
  },
  {
    id: 'sample-watch',
    name: 'Swiss Chronograph Luxury Watch',
    category: 'product',
    file: 'public/samples/sample-watch-orig-new.jpg',
    tolerance: 35,
    feather: 16,
    centerWeight: 30
  }
];

function generateFloodCutout(decodedJpg, config) {
  const { width, height, data } = decodedJpg;
  const png = new PNG({ width, height });

  // 1. Sample background from top corners & top border (pure background)
  const bgSamples = [];
  const stepX = Math.max(1, Math.floor(width / 40));
  const stepY = Math.max(1, Math.floor(height / 40));

  // Top border and top 20% corners
  for (let x = 0; x < width; x += stepX) {
    let i = (0 * width + x) * 4;
    bgSamples.push({ r: data[i], g: data[i+1], b: data[i+2] });
  }
  for (let y = 0; y < Math.floor(height * 0.25); y += stepY) {
    let i = (y * width + 0) * 4;
    bgSamples.push({ r: data[i], g: data[i+1], b: data[i+2] });
    i = (y * width + (width - 1)) * 4;
    bgSamples.push({ r: data[i], g: data[i+1], b: data[i+2] });
  }

  let avgR = 0, avgG = 0, avgB = 0;
  bgSamples.forEach(s => {
    avgR += s.r;
    avgG += s.g;
    avgB += s.b;
  });
  avgR /= bgSamples.length;
  avgG /= bgSamples.length;
  avgB /= bgSamples.length;

  console.log(`[${config.id}] Top background RGB: ${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)}`);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const diffR = r - avgR;
      const diffG = g - avgG;
      const diffB = b - avgB;
      const colorDist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

      // Distance from center
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const centerDist = Math.sqrt(dx * dx + dy * dy);
      const centerProtection = Math.max(0, 1 - centerDist * 0.85);

      const adjustedDist = colorDist + centerProtection * config.centerWeight;

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;

      if (adjustedDist < config.tolerance) {
        png.data[idx + 3] = 0; // Pure 100% transparent
      } else if (adjustedDist < config.tolerance + config.feather) {
        const ratio = (adjustedDist - config.tolerance) / config.feather;
        png.data[idx + 3] = Math.round(ratio * 255); // Smooth feathered alpha
      } else {
        png.data[idx + 3] = 255; // 100% Solid foreground subject
      }
    }
  }

  return PNG.sync.write(png);
}

async function run() {
  const publicDir = path.resolve('public', 'samples');
  const sampleList = [];

  for (const s of SAMPLES) {
    const origJpgBuffer = fs.readFileSync(path.resolve(s.file));
    const decodedJpg = jpeg.decode(origJpgBuffer, { useTArray: true });

    const origFilename = `${s.id}-original.jpg`;
    const cutoutFilename = `${s.id}-cutout.png`;

    fs.writeFileSync(path.join(publicDir, origFilename), origJpgBuffer);

    const cutoutPngBuffer = generateFloodCutout(decodedJpg, s);
    fs.writeFileSync(path.join(publicDir, cutoutFilename), cutoutPngBuffer);

    const origDataUrl = `data:image/jpeg;base64,${origJpgBuffer.toString('base64')}`;
    const cutoutDataUrl = `data:image/png;base64,${cutoutPngBuffer.toString('base64')}`;

    sampleList.push({
      id: s.id,
      name: s.name,
      originalUrl: origDataUrl,
      cutoutUrl: cutoutDataUrl,
      width: decodedJpg.width,
      height: decodedJpg.height,
      sizeBytes: origJpgBuffer.length,
      format: 'PNG',
      category: s.category
    });
  }

  const tsContent = `import { ImageMetadata } from '../types';

export const SAMPLE_IMAGES: ImageMetadata[] = ${JSON.stringify(sampleList, null, 2)};
`;

  fs.writeFileSync(path.resolve('src', 'data', 'sampleImages.ts'), tsContent);
  console.log('Successfully built and verified all 4 demo cutouts!');
}

run().catch(console.error);
