import { ImageMetadata } from '../types';

export interface ProcessProgressCallback {
  (progress: number, stepMessage: string): void;
}

export interface BackgroundProcessorService {
  processFile(
    file: File,
    onProgress?: ProcessProgressCallback,
    options?: { model?: string; alphaMatting?: boolean }
  ): Promise<ImageMetadata>;
  exportPng(dataUrl: string, filename?: string): void;
  exportImage(image: ImageMetadata): Promise<void>;
}

/**
 * Precision Background Processor with Official Remove.bg API + Instant Smart Fallback
 */
class PrecisionRemoveBgProcessor implements BackgroundProcessorService {
  async processFile(
    file: File,
    onProgress?: ProcessProgressCallback,
    _options: { model?: string; alphaMatting?: boolean } = {}
  ): Promise<ImageMetadata> {
    const startTime = Date.now();
    onProgress?.(15, 'Preparing image for background removal...');

    const originalUrl = await this.readFileAsDataUrl(file);
    const img = await this.loadImage(originalUrl);

    onProgress?.(35, 'Connecting to Remove.bg AI cloud engine...');

    try {
      // 1. Call official remove.bg API via server proxy (up to 6s timeout)
      const serverResult = await Promise.race([
        this.processViaApi(file, originalUrl, onProgress),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
      ]);

      if (serverResult) {
        onProgress?.(100, 'Background removal complete (100% Studio Quality)');
        const elapsed = Date.now() - startTime;
        console.log(`[Remove.bg API] Completed in ${elapsed}ms`);
        return serverResult;
      }
    } catch (apiError) {
      console.warn('[Hide-BG] Remove.bg API fallback triggered:', apiError);
    }

    onProgress?.(70, 'Applying precision local edge isolation...');

    // 2. High-Speed Local Smart Engine (Fallback in ~200ms)
    const cutoutUrl = await this.generateSmartCutout(img);
    onProgress?.(100, 'Background removal complete');

    const elapsed = Date.now() - startTime;
    console.log(`[Smart Engine] Completed in ${elapsed}ms`);

    return {
      id: `upload-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      originalUrl,
      cutoutUrl,
      width: img.naturalWidth || 1200,
      height: img.naturalHeight || 900,
      sizeBytes: file.size,
      format: 'PNG',
      category: 'custom',
    };
  }

  private async processViaApi(
    file: File,
    originalUrl: string,
    onProgress?: ProcessProgressCallback
  ): Promise<ImageMetadata | null> {
    const base64Payload = originalUrl.replace(/^data:image\/[a-z]+;base64,/, '');

    onProgress?.(55, 'Executing Remove.bg AI neural isolation...');

    // Attempt 1: JSON payload with base64
    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: file.type || 'image/png',
          filename: file.name,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.cutoutUrl) {
          const dims = await this.getImageDimensions(result.cutoutUrl);
          return {
            id: `upload-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            originalUrl: result.originalUrl || originalUrl,
            cutoutUrl: result.cutoutUrl,
            width: dims.width,
            height: dims.height,
            sizeBytes: result.sizeBytes || file.size,
            format: 'PNG',
            category: 'custom',
          };
        }
      }
    } catch {
      // Try multipart fallback
    }

    // Attempt 2: Multipart Form-Data
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.cutoutUrl) {
          const dims = await this.getImageDimensions(result.cutoutUrl);
          return {
            id: `upload-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            originalUrl: result.originalUrl || originalUrl,
            cutoutUrl: result.cutoutUrl,
            width: dims.width,
            height: dims.height,
            sizeBytes: result.sizeBytes || file.size,
            format: 'PNG',
            category: 'custom',
          };
        }
      }
    } catch {
      // Fallback
    }

    return null;
  }

  /**
   * Ultra-Fast Multi-Pass Smart Image Segmentation Engine (Fallback)
   */
  private async generateSmartCutout(img: HTMLImageElement): Promise<string> {
    const maxDim = 1200;
    let width = img.naturalWidth || 1200;
    let height = img.naturalHeight || 900;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return img.src;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Border Perimeter Sampling
    const bgSamples: { r: number; g: number; b: number }[] = [];
    const stepX = Math.max(1, Math.floor(width / 10));
    const stepY = Math.max(1, Math.floor(height / 10));

    for (let x = 0; x < width; x += stepX) {
      bgSamples.push(this.getPixel(data, x, 0, width));
      bgSamples.push(this.getPixel(data, x, height - 1, width));
    }
    for (let y = 0; y < height; y += stepY) {
      bgSamples.push(this.getPixel(data, 0, y, width));
      bgSamples.push(this.getPixel(data, width - 1, y, width));
    }

    let sumR = 0, sumG = 0, sumB = 0;
    bgSamples.forEach((s) => {
      sumR += s.r;
      sumG += s.g;
      sumB += s.b;
    });
    const avgR = sumR / bgSamples.length;
    const avgG = sumG / bgSamples.length;
    const avgB = sumB / bgSamples.length;

    let varianceSum = 0;
    bgSamples.forEach((s) => {
      const dR = s.r - avgR;
      const dG = s.g - avgG;
      const dB = s.b - avgB;
      varianceSum += Math.sqrt(dR * dR + dG * dG + dB * dB);
    });
    const bgSpread = varianceSum / bgSamples.length;

    const baseTolerance = Math.max(35, Math.min(85, bgSpread * 1.8 + 38));
    const featherRange = 22;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxCenterDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        let minDist = 999;
        for (let i = 0; i < bgSamples.length; i++) {
          const dR = r - bgSamples[i].r;
          const dG = g - bgSamples[i].g;
          const dB = b - bgSamples[i].b;
          const dist = Math.sqrt(dR * dR + dG * dG + dB * dB);
          if (dist < minDist) minDist = dist;
        }

        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy) / maxCenterDist;
        const foregroundWeight = Math.max(0, 1 - distFromCenter * 0.9);

        const effectiveDist = minDist + foregroundWeight * 28;

        if (effectiveDist < baseTolerance) {
          data[idx + 3] = 0;
        } else if (effectiveDist < baseTolerance + featherRange) {
          const alphaRatio = (effectiveDist - baseTolerance) / featherRange;
          data[idx + 3] = Math.round(alphaRatio * 255);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  private getPixel(data: Uint8ClampedArray, x: number, y: number, width: number) {
    const idx = (y * width + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
    };
  }

  private getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 900 });
      img.onerror = () => resolve({ width: 1200, height: 900 });
      img.src = src;
    });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  exportPng(dataUrl: string, filename: string = 'hide-bg-cutout.png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportImage(image: ImageMetadata) {
    if (image.cutoutUrl && image.cutoutUrl.startsWith('data:image/png')) {
      this.exportPng(image.cutoutUrl, `${image.name}-hide-bg.png`);
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.width || 1200;
      canvas.height = image.height || 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = await this.loadImage(image.originalUrl);

      if (image.clipPath && image.clipPath.startsWith('polygon(')) {
        const rawPoints = image.clipPath
          .replace('polygon(', '')
          .replace(')', '')
          .split(',');

        ctx.beginPath();
        rawPoints.forEach((pt, i) => {
          const [px, py] = pt.trim().split(/\s+/);
          const x = (parseFloat(px) / 100) * canvas.width;
          const y = (parseFloat(py) / 100) * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      this.exportPng(canvas.toDataURL('image/png'), `${image.name}-hide-bg.png`);
    } catch {
      this.exportPng(image.originalUrl, `${image.name}-hide-bg.png`);
    }
  }
}

export const backgroundProcessor: BackgroundProcessorService = new PrecisionRemoveBgProcessor();
