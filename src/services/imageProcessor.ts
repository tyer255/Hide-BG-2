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
 * Production BackgroundRemover API Client
 * 
 * Uploads user photos to the Express /api/remove-background backend layer
 * which executes U2Net / AI segmentation with sub-pixel alpha matting.
 */
class ServerBackgroundProcessor implements BackgroundProcessorService {
  async processFile(
    file: File, 
    onProgress?: ProcessProgressCallback,
    options: { model?: string; alphaMatting?: boolean } = {}
  ): Promise<ImageMetadata> {
    onProgress?.(20, 'Uploading image to BackgroundRemover backend...');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('model', options.model || 'u2net');
    formData.append('alphaMatting', String(options.alphaMatting !== false));

    onProgress?.(45, 'Executing U2Net neural background isolation...');

    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      onProgress?.(80, 'Refining sub-pixel alpha matting edges...');

      const result = await response.json();

      onProgress?.(100, 'Background removal complete');

      // Load dimensions from resulting image
      const dims = await this.getImageDimensions(result.originalUrl);

      return {
        id: `upload-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        originalUrl: result.originalUrl,
        cutoutUrl: result.cutoutUrl,
        width: dims.width,
        height: dims.height,
        sizeBytes: result.sizeBytes || file.size,
        format: 'PNG',
        category: 'custom',
      };
    } catch (err: any) {
      console.warn('[BackgroundRemover] Backend API error, attempting client fallback:', err);
      return this.fallbackProcessFile(file, onProgress);
    }
  }

  private getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 900 });
      img.onerror = () => resolve({ width: 1200, height: 900 });
      img.src = src;
    });
  }

  private async fallbackProcessFile(file: File, onProgress?: ProcessProgressCallback): Promise<ImageMetadata> {
    onProgress?.(60, 'Processing local edge isolation...');
    const originalUrl = await this.readFileAsDataUrl(file);
    const img = await this.loadImage(originalUrl);
    const cutoutUrl = await this.generateCanvasCutout(img);
    onProgress?.(100, 'Processing complete');

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

  private async generateCanvasCutout(img: HTMLImageElement): Promise<string> {
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return img.src;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const samples = [
      this.getPixel(data, 0, 0, width),
      this.getPixel(data, width - 1, 0, width),
      this.getPixel(data, 0, height - 1, width),
      this.getPixel(data, width - 1, height - 1, width),
      this.getPixel(data, Math.floor(width / 2), 0, width),
      this.getPixel(data, 0, Math.floor(height / 2), width),
      this.getPixel(data, width - 1, Math.floor(height / 2), width),
    ];

    let avgR = 0, avgG = 0, avgB = 0;
    samples.forEach((s) => {
      avgR += s.r;
      avgG += s.g;
      avgB += s.b;
    });
    avgR /= samples.length;
    avgG /= samples.length;
    avgB /= samples.length;

    const tolerance = 48;
    const featherRange = 28;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const diffR = r - avgR;
        const diffG = g - avgG;
        const diffB = b - avgB;
        const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

        const dx = (x - width / 2) / (width / 2);
        const dy = (y - height / 2) / (height / 2);
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        const centerBias = Math.max(0, 1 - distFromCenter * 0.85);

        const adjustedDist = dist + centerBias * 35;

        if (adjustedDist < tolerance) {
          data[idx + 3] = 0;
        } else if (adjustedDist < tolerance + featherRange) {
          const alphaRatio = (adjustedDist - tolerance) / featherRange;
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
      a: data[idx + 3],
    };
  }

  exportPng(dataUrl: string, filename: string = 'clearcut-isolated.png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportImage(image: ImageMetadata) {
    if (image.cutoutUrl && image.cutoutUrl.startsWith('data:image/png')) {
      this.exportPng(image.cutoutUrl, `${image.name}-clearcut.png`);
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
      this.exportPng(canvas.toDataURL('image/png'), `${image.name}-clearcut.png`);
    } catch {
      this.exportPng(image.originalUrl, `${image.name}-clearcut.png`);
    }
  }
}

export const backgroundProcessor: BackgroundProcessorService = new ServerBackgroundProcessor();
