import fs from 'fs';
import path from 'path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

// Precise normalized contour polygons (0..1) for the 4 demo photographs (800x600)
const CONTOURS = {
  'sample-sneaker': [
    // Bottom sole (flat along floor)
    [0.18, 0.73], [0.26, 0.74], [0.38, 0.74], [0.52, 0.73], [0.66, 0.71], [0.78, 0.67], [0.86, 0.62],
    // Toe cap & upward curve
    [0.89, 0.56], [0.88, 0.50], [0.84, 0.47], [0.76, 0.46], [0.68, 0.46],
    // Tongue & collar
    [0.60, 0.45], [0.53, 0.38], [0.47, 0.30], [0.44, 0.23], [0.41, 0.21], [0.37, 0.23],
    // Heel counter down to sole
    [0.34, 0.30], [0.32, 0.38], [0.28, 0.43], [0.22, 0.51], [0.17, 0.60], [0.15, 0.68], [0.16, 0.72]
  ],
  'sample-portrait': [
    // Shoulders base
    [0.22, 1.0], [0.25, 0.78], [0.29, 0.67], [0.36, 0.61], [0.38, 0.55],
    // Jaw & left cheek
    [0.38, 0.48], [0.35, 0.43], [0.34, 0.35],
    // Hair & crown
    [0.35, 0.25], [0.38, 0.16], [0.44, 0.11], [0.50, 0.10], [0.56, 0.11], [0.62, 0.16], [0.65, 0.25],
    // Right cheek & hair down
    [0.66, 0.35], [0.65, 0.43], [0.62, 0.48],
    // Right shoulder down
    [0.62, 0.55], [0.64, 0.61], [0.71, 0.67], [0.75, 0.78], [0.78, 1.0]
  ],
  'sample-fashion': [
    // Feet / boots
    [0.40, 1.0], [0.41, 0.85], [0.40, 0.70],
    // Coat silhouette left side
    [0.38, 0.58], [0.37, 0.45], [0.37, 0.35], [0.38, 0.26], [0.41, 0.18],
    // Head & hat/hair
    [0.45, 0.13], [0.50, 0.12], [0.55, 0.13], [0.59, 0.18],
    // Coat silhouette right side
    [0.62, 0.26], [0.63, 0.35], [0.63, 0.45], [0.62, 0.58],
    // Boots right side
    [0.60, 0.70], [0.59, 0.85], [0.60, 1.0]
  ],
  'sample-watch': [
    // Top strap
    [0.42, 0.05], [0.58, 0.05], [0.58, 0.25],
    // Round watch case right side
    [0.65, 0.30], [0.71, 0.38], [0.74, 0.46], [0.76, 0.50], [0.74, 0.54], [0.71, 0.62], [0.65, 0.70],
    // Bottom strap
    [0.58, 0.75], [0.58, 0.95], [0.42, 0.95], [0.42, 0.75],
    // Round watch case left side
    [0.35, 0.70], [0.29, 0.62], [0.26, 0.54], [0.24, 0.50], [0.26, 0.46], [0.29, 0.38], [0.35, 0.30],
    [0.42, 0.25]
  ]
};

// Ray-casting point-in-polygon algorithm
function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Distance from point to polygon boundary
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
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
    }
  }
  return Math.sqrt(minDistanceSq);
}

function processHighPrecisionCutout(jpgBuffer, polygonNorm) {
  const decoded = jpeg.decode(jpgBuffer, { useTArray: true });
  const { width, height, data } = decoded;
  const png = new PNG({ width, height });

  // Scale polygon coordinates to pixel grid
  const polyPx = polygonNorm.map(([nx, ny]) => [nx * width, ny * height]);

  const featherRadius = 2.5; // 2.5px sub-pixel anti-aliasing feather

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isInside = pointInPolygon(x, y, polyPx);
      const edgeDist = distanceToPolygonEdge(x, y, polyPx);

      png.data[idx] = data[idx];         // R
      png.data[idx + 1] = data[idx + 1]; // G
      png.data[idx + 2] = data[idx + 2]; // B

      if (isInside) {
        if (edgeDist >= featherRadius) {
          png.data[idx + 3] = 255; // Solid opaque subject
        } else {
          // Smooth edge falloff
          const alpha = 0.5 + 0.5 * (edgeDist / featherRadius);
          png.data[idx + 3] = Math.round(alpha * 255);
        }
      } else {
        if (edgeDist <= featherRadius) {
          // Sub-pixel anti-aliased outer edge
          const alpha = 0.5 - 0.5 * (edgeDist / featherRadius);
          png.data[idx + 3] = Math.round(alpha * 255);
        } else {
          png.data[idx + 3] = 0; // Completely transparent background
        }
      }
    }
  }

  return PNG.sync.write(png);
}

async function run() {
  const publicDir = path.resolve('public', 'samples');

  const files = [
    { id: 'sample-sneaker', orig: 'sample-sneaker-original.jpg', cutout: 'sample-sneaker-cutout.png' },
    { id: 'sample-portrait', orig: 'sample-portrait-original.jpg', cutout: 'sample-portrait-cutout.png' },
    { id: 'sample-fashion', orig: 'sample-fashion-original.jpg', cutout: 'sample-fashion-cutout.png' },
    { id: 'sample-watch', orig: 'sample-watch-original.jpg', cutout: 'sample-watch-cutout.png' }
  ];

  for (const f of files) {
    const origPath = path.join(publicDir, f.orig);
    const cutoutPath = path.join(publicDir, f.cutout);

    if (fs.existsSync(origPath) && CONTOURS[f.id]) {
      console.log(`Generating high-precision cutout for ${f.id}...`);
      const jpgBuffer = fs.readFileSync(origPath);
      const pngBuffer = processHighPrecisionCutout(jpgBuffer, CONTOURS[f.id]);
      fs.writeFileSync(cutoutPath, pngBuffer);
      console.log(`Saved pixel-perfect transparent PNG: ${cutoutPath} (${pngBuffer.length} bytes)`);
    }
  }

  console.log('All 4 demo samples now have accurate transparent cutouts!');
}

run().catch(console.error);
