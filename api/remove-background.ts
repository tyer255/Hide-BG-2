import type { VercelRequest, VercelResponse } from '@vercel/node';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY || '';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 payload' });
      return;
    }

    const base64Clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // 1. First priority: Call Official Remove.bg API
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
      formData.append('image_file', blob, 'image.png');
      formData.append('size', 'auto');

      const removeBgResp = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (removeBgResp.ok) {
        const arrayBuf = await removeBgResp.arrayBuffer();
        const cutoutBuffer = Buffer.from(arrayBuf);

        res.status(200).json({
          success: true,
          originalUrl: `data:${mimeType};base64,${base64Clean}`,
          cutoutUrl: `data:image/png;base64,${cutoutBuffer.toString('base64')}`,
          format: 'PNG',
          sizeBytes: cutoutBuffer.length,
          engine: 'remove.bg-official',
        });
        return;
      } else {
        const errTxt = await removeBgResp.text();
        console.warn('[Vercel Remove.bg API] HTTP Error:', removeBgResp.status, errTxt);
      }
    } catch (apiErr) {
      console.warn('[Vercel Remove.bg API] Failed to call external API:', apiErr);
    }

    // 2. High-speed local adaptive fallback
    let width = 800;
    let height = 600;
    let rawRgba: Uint8Array | Uint8ClampedArray;

    if (mimeType.includes('png')) {
      const parsedPng = PNG.sync.read(buffer);
      width = parsedPng.width;
      height = parsedPng.height;
      rawRgba = parsedPng.data;
    } else {
      const decodedJpg = jpeg.decode(buffer, { useTArray: true });
      width = decodedJpg.width;
      height = decodedJpg.height;
      rawRgba = decodedJpg.data;
    }

    const outPng = new PNG({ width, height });
    const corners = [
      0,
      (width - 1) * 4,
      ((height - 1) * width) * 4,
      ((height - 1) * width + (width - 1)) * 4,
    ];

    let sumR = 0, sumG = 0, sumB = 0;
    corners.forEach((idx) => {
      sumR += rawRgba[idx];
      sumG += rawRgba[idx + 1];
      sumB += rawRgba[idx + 2];
    });

    const avgR = sumR / corners.length;
    const avgG = sumG / corners.length;
    const avgB = sumB / corners.length;

    const tolerance = 48;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxCenterDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = rawRgba[idx], g = rawRgba[idx + 1], b = rawRgba[idx + 2];
        const dist = Math.sqrt((r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2);

        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy) / maxCenterDist;
        const foregroundBias = Math.max(0, 1 - distFromCenter * 0.85);

        const effectiveDist = dist + foregroundBias * 30;

        outPng.data[idx] = r;
        outPng.data[idx + 1] = g;
        outPng.data[idx + 2] = b;
        outPng.data[idx + 3] = effectiveDist < tolerance ? 0 : 255;
      }
    }

    const outputBuffer = PNG.sync.write(outPng);

    res.status(200).json({
      success: true,
      originalUrl: `data:${mimeType};base64,${base64Clean}`,
      cutoutUrl: `data:image/png;base64,${outputBuffer.toString('base64')}`,
      format: 'PNG',
      sizeBytes: outputBuffer.length,
      engine: 'smart-adaptive-fallback',
    });
  } catch (error: any) {
    console.error('[Vercel remove-background] Error:', error);
    res.status(500).json({
      error: 'Failed to process background removal',
      details: error?.message || String(error),
    });
  }
}
