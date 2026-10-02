import fs from 'fs';
import path from 'path';
import https from 'https';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const SAMPLES = [
  {
    id: 'sample-sneaker',
    name: 'Nike Air Max Runner',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&h=600&q=85',
    category: 'product',
    tolerance: 50,
    feather: 30,
    edgeWeight: 35
  },
  {
    id: 'sample-portrait',
    name: 'Executive Studio Portrait',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&h=600&q=85',
    category: 'portrait',
    tolerance: 45,
    feather: 28,
    edgeWeight: 30
  },
  {
    id: 'sample-fashion',
    name: 'Editorial Lookbook Model',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&h=600&q=85',
    category: 'fashion',
    tolerance: 48,
    feather: 25,
    edgeWeight: 32
  },
  {
    id: 'sample-watch',
    name: 'Swiss Chronograph Luxury Watch',
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&h=600&q=85',
    category: 'product',
    tolerance: 52,
    feather: 30,
    edgeWeight: 35
  }
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function processCutout(rawJpg, config) {
  const { width, height, data } = rawJpg;
  const png = new PNG({ width, height });

  // Sample corner backdrop pixels
  const cornerCoords = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
    [Math.floor(width * 0.1), Math.floor(height * 0.1)],
    [Math.floor(width * 0.9), Math.floor(height * 0.1)]
  ];

  let avgR = 0, avgG = 0, avgB = 0;
  for (const [cx, cy] of cornerCoords) {
    const idx = (cy * width + cx) * 4;
    avgR += data[idx];
    avgG += data[idx + 1];
    avgB += data[idx + 2];
  }
  avgR /= cornerCoords.length;
  avgG /= cornerCoords.length;
  avgB /= cornerCoords.length;

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
      const centerBias = Math.max(0, 1 - centerDist * 0.85);

      const adjustedDist = colorDist + centerBias * config.edgeWeight;

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;

      if (adjustedDist < config.tolerance) {
        png.data[idx + 3] = 0; // Pure Transparent
      } else if (adjustedDist < config.tolerance + config.feather) {
        const alphaRatio = (adjustedDist - config.tolerance) / config.feather;
        png.data[idx + 3] = Math.round(alphaRatio * 255);
      } else {
        png.data[idx + 3] = 255; // Fully Opaque
      }
    }
  }

  return PNG.sync.write(png);
}

async function run() {
  const publicDir = path.resolve('public', 'samples');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const generatedSamples = [];

  for (const item of SAMPLES) {
    console.log(`Processing ${item.name}...`);
    const jpgBuffer = await fetchBuffer(item.url);
    
    // Save original image locally in public/samples
    const origFilename = `${item.id}-original.jpg`;
    fs.writeFileSync(path.join(publicDir, origFilename), jpgBuffer);

    // Decode & process transparent cutout PNG
    const decodedJpg = jpeg.decode(jpgBuffer, { useTArray: true });
    const pngBuffer = processCutout(decodedJpg, item);
    
    // Save cutout PNG locally in public/samples
    const cutoutFilename = `${item.id}-cutout.png`;
    fs.writeFileSync(path.join(publicDir, cutoutFilename), pngBuffer);

    console.log(`Saved: /samples/${origFilename} and /samples/${cutoutFilename}`);

    generatedSamples.push({
      id: item.id,
      name: item.name,
      originalUrl: `/samples/${origFilename}`,
      cutoutUrl: `/samples/${cutoutFilename}`,
      width: decodedJpg.width,
      height: decodedJpg.height,
      sizeBytes: jpgBuffer.length,
      format: 'PNG',
      category: item.category
    });
  }

  // Generate src/data/sampleImages.ts
  const tsContent = `import { ImageMetadata } from '../types';

export const SAMPLE_IMAGES: ImageMetadata[] = ${JSON.stringify(generatedSamples, null, 2)};
`;

  fs.writeFileSync(path.resolve('src', 'data', 'sampleImages.ts'), tsContent);
  console.log('Successfully updated src/data/sampleImages.ts with pre-rendered transparent cutouts!');
}

run().catch(console.error);
