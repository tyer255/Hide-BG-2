import fs from 'fs';
import path from 'path';
import https from 'https';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const CANDIDATES = [
  {
    id: 'sample-sneaker',
    name: 'Nike Air Sport Sneaker',
    category: 'product',
    // High-resolution centered sneaker on clean studio background
    url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&h=600&q=85'
  },
  {
    id: 'sample-portrait',
    name: 'Executive Studio Portrait',
    category: 'portrait',
    // High-resolution centered corporate portrait
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&h=600&q=85'
  },
  {
    id: 'sample-fashion',
    name: 'Editorial Lookbook Model',
    category: 'fashion',
    // High-resolution centered fashion model
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&h=600&q=85'
  },
  {
    id: 'sample-watch',
    name: 'Swiss Chronograph Luxury Watch',
    category: 'product',
    // High-resolution centered luxury watch on marble surface
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&h=600&q=85'
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

async function run() {
  for (const c of CANDIDATES) {
    console.log(`Downloading ${c.name}...`);
    const buf = await fetchBuffer(c.url);
    const decoded = jpeg.decode(buf, { useTArray: true });
    console.log(`${c.id}: ${decoded.width}x${decoded.height}, size: ${buf.length} bytes`);
    fs.writeFileSync(`public/samples/${c.id}-orig-new.jpg`, buf);
  }
}

run().catch(console.error);
