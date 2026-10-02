import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const SAMPLES = [
  {
    id: 'sample-sneaker',
    name: 'Nike Air Sport Sneaker',
    category: 'product',
    origFile: 'public/samples/sample-sneaker-original.jpg',
    cutoutFile: 'public/samples/sample-sneaker-cutout.png'
  },
  {
    id: 'sample-portrait',
    name: 'Executive Studio Portrait',
    category: 'portrait',
    origFile: 'public/samples/sample-portrait-original.jpg',
    cutoutFile: 'public/samples/sample-portrait-cutout.png'
  },
  {
    id: 'sample-fashion',
    name: 'Editorial Lookbook Model',
    category: 'fashion',
    origFile: 'public/samples/sample-fashion-original.jpg',
    cutoutFile: 'public/samples/sample-fashion-cutout.png'
  },
  {
    id: 'sample-watch',
    name: 'Swiss Chronograph Luxury Watch',
    category: 'product',
    origFile: 'public/samples/sample-watch-original.jpg',
    cutoutFile: 'public/samples/sample-watch-cutout.png'
  }
];

async function run() {
  const updatedSamples = [];

  for (const s of SAMPLES) {
    console.log(`[rembg] Processing AI background removal for ${s.name}...`);
    const origBuffer = fs.readFileSync(path.resolve(s.origFile));
    const inputBlob = new Blob([origBuffer], { type: 'image/jpeg' });

    const resultBlob = await removeBackground(inputBlob, {
      output: {
        format: 'image/png',
        quality: 0.95
      }
    });

    const arrayBuffer = await resultBlob.arrayBuffer();
    const cutoutBuffer = Buffer.from(arrayBuffer);

    // Save physical file
    fs.writeFileSync(path.resolve(s.cutoutFile), cutoutBuffer);
    console.log(`[rembg] Saved ${s.cutoutFile} (${cutoutBuffer.length} bytes)`);

    const origDataUrl = `data:image/jpeg;base64,${origBuffer.toString('base64')}`;
    const cutoutDataUrl = `data:image/png;base64,${cutoutBuffer.toString('base64')}`;

    updatedSamples.push({
      id: s.id,
      name: s.name,
      originalUrl: origDataUrl,
      cutoutUrl: cutoutDataUrl,
      width: 800,
      height: 600,
      sizeBytes: origBuffer.length,
      format: 'PNG',
      category: s.category
    });
  }

  const tsContent = `import { ImageMetadata } from '../types';

export const SAMPLE_IMAGES: ImageMetadata[] = ${JSON.stringify(updatedSamples, null, 2)};
`;

  fs.writeFileSync(path.resolve('src', 'data', 'sampleImages.ts'), tsContent);
  console.log('[rembg] Successfully processed all 4 demo assets with rembg AI neural model!');
}

run().catch(console.error);
