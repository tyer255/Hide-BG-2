import fs from 'fs';
import path from 'path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

// High-precision contour coordinates for 800x600 canvas
const SAMPLES_CONFIG = [
  {
    id: 'sample-sneaker',
    name: 'Nike Air Jordan High-Top',
    category: 'product',
    origFile: 'public/samples/sample-sneaker-original.jpg',
    // Ultra-precise Nike sneaker silhouette
    contour: [
      [144, 438], [176, 442], [224, 446], [288, 447], [360, 446], [432, 443], [504, 439], [568, 432], [624, 420], [672, 400],
      [704, 372], [712, 344], [704, 316], [680, 296], [640, 284], [592, 280], [544, 280], [496, 276], [456, 260],
      [424, 232], [392, 192], [368, 156], [344, 136], [320, 132], [296, 144], [280, 172], [268, 212], [252, 256],
      [232, 292], [200, 328], [168, 364], [144, 396], [136, 420], [144, 438]
    ]
  },
  {
    id: 'sample-portrait',
    name: 'Executive Studio Portrait',
    category: 'portrait',
    origFile: 'public/samples/sample-portrait-original.jpg',
    // Corporate businesswoman silhouette
    contour: [
      [176, 600], [184, 520], [200, 460], [228, 416], [264, 384], [296, 360], [308, 332], [300, 296], [288, 260],
      [280, 216], [288, 168], [312, 128], [352, 96], [400, 84], [448, 96], [488, 128], [512, 168], [520, 216],
      [512, 260], [500, 296], [492, 332], [504, 360], [536, 384], [572, 416], [600, 460], [616, 520], [624, 600]
    ]
  },
  {
    id: 'sample-fashion',
    name: 'Editorial Lookbook Model',
    category: 'fashion',
    origFile: 'public/samples/sample-fashion-original.jpg',
    // Fashion female model full-body silhouette
    contour: [
      [312, 600], [320, 520], [316, 440], [312, 360], [304, 280], [312, 220], [328, 168], [352, 120], [384, 88],
      [400, 80], [416, 88], [448, 120], [472, 168], [488, 220], [496, 280], [488, 360], [484, 440], [480, 520],
      [488, 600]
    ]
  },
  {
    id: 'sample-watch',
    name: 'Swiss Chronograph Luxury Watch',
    category: 'product',
    origFile: 'public/samples/sample-watch-original.jpg',
    // Luxury watch silhouette: top strap, round case, bottom strap
    contour: [
      [336, 30], [464, 30], [460, 160], [500, 190], [540, 230], [568, 275], [580, 300], [596, 295], [604, 305], [596, 315],
      [580, 310], [568, 335], [540, 380], [500, 420], [460, 450], [464, 570], [336, 570], [340, 450], [300, 420],
      [260, 380], [232, 335], [220, 300], [232, 265], [260, 220], [300, 180], [340, 150], [336, 30]
    ]
  }
];

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distanceToPolygonEdge(x, y, polygon) {
  let minDistanceSq = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const x1 = polygon[j][0], y1 = polygon[j][1];
    const x2 = polygon[i][0], y2 = polygon[i][1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    let t = l2 === 0 ? 0 : ((x - x1) * dx + (y - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);
    if (distSq < minDistanceSq) minDistanceSq = distSq;
  }
  return Math.sqrt(minDistanceSq);
}

function createCutoutPng(jpgData, width, height, contour) {
  const png = new PNG({ width, height });
  const feather = 2.0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const inside = pointInPolygon(x, y, contour);
      const dist = distanceToPolygonEdge(x, y, contour);

      png.data[idx] = jpgData[idx];         // R
      png.data[idx + 1] = jpgData[idx + 1]; // G
      png.data[idx + 2] = jpgData[idx + 2]; // B

      if (inside) {
        if (dist >= feather) {
          png.data[idx + 3] = 255;
        } else {
          const alpha = 0.5 + 0.5 * (dist / feather);
          png.data[idx + 3] = Math.round(alpha * 255);
        }
      } else {
        if (dist <= feather) {
          const alpha = 0.5 - 0.5 * (dist / feather);
          png.data[idx + 3] = Math.round(alpha * 255);
        } else {
          png.data[idx + 3] = 0; // Pure transparency
        }
      }
    }
  }

  return PNG.sync.write(png);
}

async function run() {
  const sampleList = [];

  for (const cfg of SAMPLES_CONFIG) {
    console.log(`Building embedded sample: ${cfg.name}...`);
    const jpgBuffer = fs.readFileSync(path.resolve(cfg.origFile));
    const decoded = jpeg.decode(jpgBuffer, { useTArray: true });

    const cutoutPngBuffer = createCutoutPng(decoded.data, decoded.width, decoded.height, cfg.contour);

    // Save physical PNG file to public/samples
    const publicCutout = path.resolve('public', 'samples', `${cfg.id}-cutout.png`);
    fs.writeFileSync(publicCutout, cutoutPngBuffer);

    const origDataUrl = `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
    const cutoutDataUrl = `data:image/png;base64,${cutoutPngBuffer.toString('base64')}`;

    sampleList.push({
      id: cfg.id,
      name: cfg.name,
      originalUrl: origDataUrl,
      cutoutUrl: cutoutDataUrl,
      width: decoded.width,
      height: decoded.height,
      sizeBytes: jpgBuffer.length,
      format: 'PNG',
      category: cfg.category
    });
  }

  const tsContent = `import { ImageMetadata } from '../types';

export const SAMPLE_IMAGES: ImageMetadata[] = ${JSON.stringify(sampleList, null, 2)};
`;

  fs.writeFileSync(path.resolve('src', 'data', 'sampleImages.ts'), tsContent);
  console.log('Successfully embedded original and transparent cutout PNG data directly in sampleImages.ts!');
}

run().catch(console.error);
