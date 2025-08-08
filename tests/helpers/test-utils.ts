// Test Utilities and Helper Functions
// 測試工具和輔助函數

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import userEvent from '@testing-library/user-event';

// Test providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test data generators
export const generateMockCanvaUrl = (designId = 'TEST123') => 
  `https://www.canva.com/design/${designId}/view`;

export const generateMockScreenshotBuffer = (size = 1024) => 
  Buffer.alloc(size, 'mock-screenshot-data');

export const generateMockPdfBuffer = (size = 1024 * 1024) => 
  Buffer.alloc(size, 'mock-pdf-data');

// Mock data factories
export const mockCanvaDesignInfo = {
  standard: {
    designId: 'DAGutBPLlkA',
    designType: 'presentation' as const,
    isPublic: true,
    hasEditAccess: false
  },
  private: {
    designId: 'PRIVATE123',
    designType: 'presentation' as const,
    isPublic: false,
    hasEditAccess: false
  },
  editable: {
    designId: 'EDIT456',
    designType: 'presentation' as const,
    isPublic: true,
    hasEditAccess: true
  }
};

export const mockCaptureOptions = {
  standard1080p: {
    width: 1920,
    height: 1080,
    quality: 90,
    format: 'png' as const,
    waitForLoad: 5000
  },
  high4K: {
    width: 3840,
    height: 2160,
    quality: 100,
    format: 'png' as const,
    waitForLoad: 10000
  },
  compressed: {
    width: 1280,
    height: 720,
    quality: 70,
    format: 'jpeg' as const,
    waitForLoad: 3000
  }
};

export const mockDownloadOptions = {
  standard: {
    resolution: '1080p' as const,
    format: 'pdf' as const,
    quality: 'high' as const
  },
  batch: {
    resolution: '1080p' as const,
    format: 'pdf' as const,
    quality: 'medium' as const,
    concurrency: 3
  },
  highQuality: {
    resolution: '4K' as const,
    format: 'pdf' as const,
    quality: 'maximum' as const
  }
};

// Error simulation utilities
export const simulateNetworkError = () => {
  throw new Error('Network request failed');
};

export const simulateTimeoutError = () => {
  throw new Error('Request timeout');
};

export const simulatePermissionError = () => {
  throw new Error('Access denied: Private presentation');
};

// Performance testing utilities
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; executionTime: number }> => {
  const startTime = Date.now();
  const result = await fn();
  const executionTime = Date.now() - startTime;
  return { result, executionTime };
};

export const measureMemoryUsage = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage();
  }
  return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
};

// Test data validation utilities
export const isValidCanvaUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('canva.com') && 
           urlObj.pathname.includes('/design/');
  } catch {
    return false;
  }
};

export const isValidBuffer = (buffer: any): boolean => {
  return Buffer.isBuffer(buffer) && buffer.length > 0;
};

export const isValidPdfBuffer = (buffer: Buffer): boolean => {
  return buffer.length > 0 && 
         buffer.slice(0, 4).toString() === '%PDF';
};

// Mock API responses
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : null,
  error: success ? null : 'Mock API error',
  timestamp: Date.now()
});

// File system test utilities
export const createTempFile = (content: string, extension = '.txt') => {
  const filename = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
  return { filename, content };
};

export const cleanupTempFiles = (files: string[]) => {
  // In a real implementation, this would delete temporary files
  // For testing, we just track them for cleanup
  return files.length;
};

// Browser automation helpers (for integration with Playwright)
export const waitForElement = async (page: any, selector: string, timeout = 5000) => {
  return page.waitForSelector(selector, { timeout });
};

export const fillForm = async (page: any, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    await page.fill(`[data-testid="${field}"]`, value);
  }
};

export const waitForDownload = async (page: any, triggerAction: () => Promise<void>) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    triggerAction()
  ]);
  return download;
};

// Test assertion helpers
export const expectToBeWithinRange = (actual: number, expected: number, tolerance: number) => {
  const diff = Math.abs(actual - expected);
  const maxDiff = expected * tolerance;
  if (diff > maxDiff) {
    throw new Error(
      `Expected ${actual} to be within ${tolerance * 100}% of ${expected} (max difference: ${maxDiff}, actual difference: ${diff})`
    );
  }
};

export const expectBufferToMatchSize = (buffer: Buffer, expectedSize: number, tolerance = 0.1) => {
  expectToBeWithinRange(buffer.length, expectedSize, tolerance);
};

// Retry utility for flaky tests
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// Test environment utilities
export const isCI = () => process.env.CI === 'true';

export const isTestEnvironment = () => process.env.NODE_ENV === 'test';

export const getTestTimeout = (testType: 'unit' | 'integration' | 'e2e') => {
  const timeouts = {
    unit: 5000,
    integration: 15000,
    e2e: 60000
  };
  return timeouts[testType];
};

// Mock implementations for common dependencies
export const createMockUrlParser = () => ({
  parseUrl: jest.fn(),
  validateUrl: jest.fn(),
  extractDesignId: jest.fn(),
  getDesignType: jest.fn()
});

export const createMockScreenshotEngine = () => ({
  captureSlide: jest.fn(),
  captureAllSlides: jest.fn(),
  getSlideCount: jest.fn(),
  cleanup: jest.fn(),
  validateOptions: jest.fn()
});

export const createMockPdfGenerator = () => ({
  createPdfFromImages: jest.fn(),
  addMetadata: jest.fn(),
  optimizePdf: jest.fn()
});

// Progress tracking test utilities
export const createProgressTracker = () => {
  const events: any[] = [];
  const tracker = {
    events,
    on: (event: string, handler: (data: any) => void) => {
      // Mock event listener
      events.push({ event, handler });
    },
    emit: (event: string, data: any) => {
      events.forEach(({ event: eventName, handler }) => {
        if (eventName === event) {
          handler(data);
        }
      });
    },
    getProgressEvents: () => events.filter(e => e.event === 'progress'),
    getLatestProgress: () => {
      const progressEvents = tracker.getProgressEvents();
      return progressEvents.length > 0 ? progressEvents[progressEvents.length - 1].data : null;
    }
  };
  return tracker;
};

// Test configuration helpers
export const getTestConfig = () => ({
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.TEST_MAX_RETRIES || '3'),
  enableNetworkMocking: process.env.MOCK_NETWORK === 'true',
  enablePerformanceMonitoring: process.env.MONITOR_PERFORMANCE === 'true'
});

// Screenshot comparison utilities
export const compareScreenshots = (actual: Buffer, expected: Buffer, threshold = 0.1) => {
  // In a real implementation, this would use image comparison libraries
  // For testing purposes, we'll do a basic size comparison
  const sizeDiff = Math.abs(actual.length - expected.length) / expected.length;
  return sizeDiff <= threshold;
};

// Export everything including re-exports from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };

// Default export with all utilities
export default {
  render: customRender,
  userEvent,
  generateMockCanvaUrl,
  generateMockScreenshotBuffer,
  generateMockPdfBuffer,
  mockCanvaDesignInfo,
  mockCaptureOptions,
  mockDownloadOptions,
  simulateNetworkError,
  simulateTimeoutError,
  simulatePermissionError,
  measureExecutionTime,
  measureMemoryUsage,
  isValidCanvaUrl,
  isValidBuffer,
  isValidPdfBuffer,
  createMockApiResponse,
  createTempFile,
  cleanupTempFiles,
  waitForElement,
  fillForm,
  waitForDownload,
  expectToBeWithinRange,
  expectBufferToMatchSize,
  retryOperation,
  isCI,
  isTestEnvironment,
  getTestTimeout,
  createMockUrlParser,
  createMockScreenshotEngine,
  createMockPdfGenerator,
  createProgressTracker,
  getTestConfig,
  compareScreenshots
};