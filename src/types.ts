export type Theme = 'light' | 'dark';

export type ViewMode = 'slider' | 'side-by-side' | 'cutout-only' | 'original-only';

export type BackdropMode = 
  | 'checkerboard-light' 
  | 'checkerboard-dark' 
  | 'white' 
  | 'slate' 
  | 'travertine' 
  | 'studio-gray';

export interface ImageMetadata {
  id: string;
  name: string;
  originalUrl: string;
  cutoutUrl: string;
  clipPath?: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  category?: 'product' | 'portrait' | 'fashion' | 'custom';
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stepMessage: string;
}
