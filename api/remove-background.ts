import type { VercelRequest, VercelResponse } from '@vercel/node';
import { removeBackground } from '@imgly/background-removal-node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

    const inputBlob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    const resultBlob = await removeBackground(inputBlob, {
      output: {
        format: 'image/png',
        quality: 0.95,
      },
    });

    const arrayBuffer = await resultBlob.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);

    res.status(200).json({
      success: true,
      originalUrl: `data:${mimeType};base64,${base64Clean}`,
      cutoutUrl: `data:image/png;base64,${outputBuffer.toString('base64')}`,
      format: 'PNG',
      sizeBytes: outputBuffer.length,
      modelUsed: 'rembg-u2net',
    });
  } catch (error: any) {
    console.error('[Vercel Serverless rembg] Error:', error);
    res.status(500).json({
      error: 'Failed to process AI background removal',
      details: error?.message || String(error),
    });
  }
}
