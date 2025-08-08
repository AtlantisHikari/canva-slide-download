// Core types for Canva Slide Downloader

export interface CanvaDesignInfo {
  designId: string;
  designType: 'presentation' | 'document' | 'design';
  title?: string;
  pageCount?: number;
  isPublic: boolean;
  hasEditAccess: boolean;
  thumbnailUrl?: string;
}

export interface CaptureOptions {
  width: number;
  height: number;
  quality: number;
  format: 'png' | 'jpeg';
  waitForLoad: number;
  deviceScaleFactor?: number;
}

export interface PdfOptions {
  pageSize: 'A4' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quality: number;
  title?: string;
  author?: string;
}

export interface PdfMetadata {
  title: string;
  author: string;
  creator: string;
  creationDate: Date;
  pageCount: number;
}

export interface DownloadOptions {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'pdf' | 'images';
  includeMetadata: boolean;
  compression: number;
}

export interface DownloadProgress {
  status: 'idle' | 'parsing' | 'capturing' | 'generating' | 'complete' | 'error';
  currentPage: number;
  totalPages: number;
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface DownloadResult {
  success: boolean;
  data?: Buffer;
  filename?: string;
  fileSize?: number;
  pageCount?: number;
  error?: string;
  processingTime?: number;
}

export interface DownloadJob {
  id: string;
  url: string;
  options: DownloadOptions;
  progress: DownloadProgress;
  result?: DownloadResult;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface DownloadHistory {
  id: string;
  url: string;
  title: string;
  pageCount: number;
  fileSize: number;
  downloadedAt: Date;
  options: DownloadOptions;
}

export interface UserPreferences {
  defaultQuality: DownloadOptions['quality'];
  defaultFormat: DownloadOptions['format'];
  autoOpenPdf: boolean;
  showPreview: boolean;
  maxConcurrentDownloads: number;
  downloadDirectory?: string;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  suggestions?: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  timestamp: string;
}

export interface ParseUrlResponse extends ApiResponse<CanvaDesignInfo> {}
export interface DownloadResponse extends ApiResponse<DownloadResult> {}
export interface ProgressResponse extends ApiResponse<DownloadProgress> {}

// Component Props types
export interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading?: boolean;
  error?: string;
}

export interface ProgressDisplayProps {
  progress: DownloadProgress;
  onCancel?: () => void;
}

export interface DownloadOptionsProps {
  options: DownloadOptions;
  onChange: (options: DownloadOptions) => void;
  disabled?: boolean;
}

export interface HistoryListProps {
  history: DownloadHistory[];
  onRedownload: (historyItem: DownloadHistory) => void;
  onDelete: (id: string) => void;
}

// Store types
export interface DownloadStore {
  jobs: Map<string, DownloadJob>;
  history: DownloadHistory[];
  preferences: UserPreferences;
  
  // Actions
  addJob: (url: string, options: DownloadOptions) => string;
  updateJobProgress: (id: string, progress: DownloadProgress) => void;
  completeJob: (id: string, result: DownloadResult) => void;
  cancelJob: (id: string) => void;
  addToHistory: (item: DownloadHistory) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  clearHistory: () => void;
}

// Utility types
export type QualityPreset = {
  [K in DownloadOptions['quality']]: CaptureOptions;
};

export type SupportedUrl = 
  | `https://www.canva.com/design/${string}/view`
  | `https://www.canva.com/design/${string}/edit`
  | `https://canva.com/design/${string}/view`
  | `https://canva.com/design/${string}/edit`;

// Constants
export const QUALITY_PRESETS: QualityPreset = {
  low: { width: 1280, height: 720, quality: 70, format: 'jpeg', waitForLoad: 3000 },
  medium: { width: 1920, height: 1080, quality: 80, format: 'png', waitForLoad: 5000 },
  high: { width: 2560, height: 1440, quality: 90, format: 'png', waitForLoad: 7000 },
  ultra: { width: 3840, height: 2160, quality: 95, format: 'png', waitForLoad: 10000 }
};

export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  pageSize: 'A4',
  orientation: 'landscape',
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  quality: 90,
  creator: 'Canva Slide Downloader'
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultQuality: 'high',
  defaultFormat: 'pdf',
  autoOpenPdf: true,
  showPreview: true,
  maxConcurrentDownloads: 3
};