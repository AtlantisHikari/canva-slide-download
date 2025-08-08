# 開發指南 (Development Guide)

## 專案設定

### 環境需求
- Node.js 18.0 或更高版本
- npm 或 yarn
- Chrome/Chromium 瀏覽器 (Puppeteer需要)

### 初始設定
```bash
# 克隆專案
cd ~/Code/starter/canva-slide-download

# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local

# 啟動開發伺服器
npm run dev
```

### 環境變數設定
建立 `.env.local` 檔案：
```env
# 應用程式設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_FILE_SIZE=52428800  # 50MB
NEXT_PUBLIC_MAX_PAGES=100

# Puppeteer 設定
PUPPETEER_EXECUTABLE_PATH=
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-web-security

# 效能設定
MAX_CONCURRENT_DOWNLOADS=3
SCREENSHOT_TIMEOUT=30000
PDF_COMPRESSION_LEVEL=0.8

# 開發模式設定
NODE_ENV=development
DEBUG_MODE=true
```

## 專案結構詳解

```
canva-slide-download/
├── docs/                          # 文件目錄
│   ├── PRD.md                     # 產品需求文件
│   ├── TECHNICAL_SPEC.md          # 技術規格
│   └── DEVELOPMENT_GUIDE.md       # 開發指南
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx            # 根布局
│   │   ├── page.tsx              # 主頁面
│   │   ├── globals.css           # 全域樣式
│   │   └── api/                  # API 路由
│   │       ├── parse/            # URL解析API
│   │       ├── download/         # 下載API
│   │       └── health/           # 健康檢查API
│   ├── components/               # React 元件
│   │   ├── ui/                   # 基礎UI元件 (shadcn/ui)
│   │   ├── download/             # 下載相關元件
│   │   │   ├── UrlInput.tsx      # URL輸入元件
│   │   │   ├── DownloadOptions.tsx # 下載選項元件
│   │   │   ├── ProgressDisplay.tsx # 進度顯示元件
│   │   │   └── HistoryList.tsx    # 歷史記錄元件
│   │   └── screenshot/           # 截圖相關元件
│   │       ├── PreviewGrid.tsx   # 預覽網格
│   │       └── QualitySelector.tsx # 品質選擇器
│   ├── lib/                      # 工具庫
│   │   ├── utils.ts              # 通用工具函數
│   │   ├── puppeteer.ts          # Puppeteer 設定
│   │   ├── pdf-generator.ts      # PDF 生成器
│   │   ├── url-parser.ts         # URL 解析器
│   │   └── store.ts              # 狀態管理 (Zustand)
│   └── types/                    # TypeScript 型別定義
│       └── index.ts              # 型別匯出
├── public/                       # 靜態資源
│   ├── icons/                    # 圖示檔案
│   └── images/                   # 圖片資源
├── tests/                        # 測試檔案
│   ├── unit/                     # 單元測試
│   ├── integration/              # 整合測試
│   └── e2e/                      # 端對端測試
└── 設定檔案
    ├── package.json              # 專案設定
    ├── next.config.js            # Next.js 設定
    ├── tailwind.config.js        # Tailwind 設定
    ├── tsconfig.json             # TypeScript 設定
    └── .eslintrc.json            # ESLint 設定
```

## 核心模組開發

### 1. URL解析器 (lib/url-parser.ts)
```typescript
import { CanvaDesignInfo } from '@/types';

export class CanvaUrlParser {
  private static readonly CANVA_DESIGN_REGEX = 
    /^https?:\/\/(?:www\.)?canva\.com\/design\/([a-zA-Z0-9_-]+)(?:\/[^?]*)?/;

  static parseUrl(url: string): CanvaDesignInfo | null {
    const match = url.match(this.CANVA_DESIGN_REGEX);
    if (!match) return null;

    const designId = match[1];
    return {
      designId,
      designType: this.detectDesignType(url),
      isPublic: url.includes('/view'),
      hasEditAccess: url.includes('/edit'),
    };
  }

  private static detectDesignType(url: string): 'presentation' | 'document' | 'design' {
    // 實作設計類型檢測邏輯
    return 'presentation';
  }
}
```

### 2. 截圖引擎 (lib/puppeteer.ts)
```typescript
import puppeteer, { Browser, Page } from 'puppeteer';
import { CaptureOptions } from '@/types';

export class ScreenshotEngine {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    });
  }

  async captureSlide(
    url: string, 
    slideIndex: number, 
    options: CaptureOptions
  ): Promise<Buffer> {
    if (!this.browser) await this.initialize();
    
    const page = await this.browser!.newPage();
    
    try {
      await page.setViewport({
        width: options.width,
        height: options.height,
        deviceScaleFactor: options.deviceScaleFactor || 2,
      });

      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(options.waitForLoad);

      // 導航到特定頁面
      await this.navigateToSlide(page, slideIndex);

      const screenshot = await page.screenshot({
        type: options.format,
        quality: options.format === 'jpeg' ? options.quality : undefined,
        fullPage: false,
      });

      return screenshot as Buffer;
    } finally {
      await page.close();
    }
  }

  private async navigateToSlide(page: Page, slideIndex: number): Promise<void> {
    // 實作頁面導航邏輯
    // 可能需要點擊下一頁按鈕或使用鍵盤快捷鍵
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 3. PDF生成器 (lib/pdf-generator.ts)
```typescript
import jsPDF from 'jspdf';
import { PdfOptions, PdfMetadata } from '@/types';

export class PdfGenerator {
  static async createPdfFromImages(
    images: Buffer[], 
    options: PdfOptions
  ): Promise<Buffer> {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.pageSize.toLowerCase(),
    });

    for (let i = 0; i < images.length; i++) {
      if (i > 0) pdf.addPage();

      const imageData = `data:image/png;base64,${images[i].toString('base64')}`;
      
      // 計算圖片尺寸以符合頁面
      const pageWidth = pdf.internal.pageSize.getWidth() - 
        options.margin.left - options.margin.right;
      const pageHeight = pdf.internal.pageSize.getHeight() - 
        options.margin.top - options.margin.bottom;

      pdf.addImage(
        imageData,
        'PNG',
        options.margin.left,
        options.margin.top,
        pageWidth,
        pageHeight
      );
    }

    return Buffer.from(pdf.output('arraybuffer'));
  }

  static addMetadata(pdfBuffer: Buffer, metadata: PdfMetadata): Buffer {
    // 實作 PDF 元數據添加
    return pdfBuffer;
  }
}
```

## API 路由開發

### 1. URL解析API (app/api/parse/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CanvaUrlParser } from '@/lib/url-parser';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_URL', message: 'URL is required' } },
        { status: 400 }
      );
    }

    const designInfo = CanvaUrlParser.parseUrl(url);
    
    if (!designInfo) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_URL', message: 'Invalid Canva URL' } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: designInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse URL' } },
      { status: 500 }
    );
  }
}
```

### 2. 下載API (app/api/download/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ScreenshotEngine } from '@/lib/puppeteer';
import { PdfGenerator } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  const engine = new ScreenshotEngine();
  
  try {
    const { url, options } = await request.json();
    
    // 實作下載邏輯
    const images = await engine.captureAllSlides(url, options);
    const pdfBuffer = await PdfGenerator.createPdfFromImages(images, options.pdf);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="canva-slides.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  } finally {
    await engine.close();
  }
}
```

## 狀態管理 (lib/store.ts)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DownloadStore, DownloadJob, DownloadHistory, UserPreferences } from '@/types';

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      jobs: new Map(),
      history: [],
      preferences: {
        defaultQuality: 'high',
        defaultFormat: 'pdf',
        autoOpenPdf: true,
        showPreview: true,
        maxConcurrentDownloads: 3,
      },

      addJob: (url: string, options) => {
        const id = crypto.randomUUID();
        const job: DownloadJob = {
          id,
          url,
          options,
          progress: {
            status: 'idle',
            currentPage: 0,
            totalPages: 0,
            percentage: 0,
            message: 'Preparing download...',
          },
          createdAt: new Date(),
        };

        set((state) => {
          const newJobs = new Map(state.jobs);
          newJobs.set(id, job);
          return { jobs: newJobs };
        });

        return id;
      },

      updateJobProgress: (id, progress) => {
        set((state) => {
          const newJobs = new Map(state.jobs);
          const job = newJobs.get(id);
          if (job) {
            newJobs.set(id, { ...job, progress });
          }
          return { jobs: newJobs };
        });
      },

      // 其他方法實作...
    }),
    {
      name: 'canva-downloader-store',
      partialize: (state) => ({
        history: state.history,
        preferences: state.preferences,
      }),
    }
  )
);
```

## 測試開發

### 單元測試範例
```typescript
// tests/unit/url-parser.test.ts
import { CanvaUrlParser } from '@/lib/url-parser';

describe('CanvaUrlParser', () => {
  test('should parse valid Canva presentation URL', () => {
    const url = 'https://www.canva.com/design/DAGutBPLlkA/view';
    const result = CanvaUrlParser.parseUrl(url);
    
    expect(result).toEqual({
      designId: 'DAGutBPLlkA',
      designType: 'presentation',
      isPublic: true,
      hasEditAccess: false,
    });
  });

  test('should return null for invalid URL', () => {
    const url = 'https://invalid-url.com';
    const result = CanvaUrlParser.parseUrl(url);
    
    expect(result).toBeNull();
  });
});
```

## 除錯與監控

### 開發模式除錯
```typescript
// lib/debug.ts
export const debugLog = (message: string, data?: any) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, data);
  }
};

export const performanceTracker = {
  start: (label: string) => console.time(label),
  end: (label: string) => console.timeEnd(label),
};
```

### 錯誤監控
```typescript
// lib/error-handler.ts
export class ErrorHandler {
  static handle(error: Error, context: Record<string, any> = {}) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // 在生產環境中，這裡可以發送到錯誤追蹤服務
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: context });
    }
  }
}
```

## 部署準備

### 1. 環境變數檢查
```bash
# 檢查必要的環境變數
npm run check-env
```

### 2. 建置測試
```bash
# 建置專案
npm run build

# 測試建置結果
npm start
```

### 3. 效能檢查
```bash
# 分析建置檔案大小
npm run analyze

# 執行效能測試
npm run perf-test
```

## 最佳實踐

### 1. 程式碼品質
- 使用 TypeScript 進行型別檢查
- 遵循 ESLint 和 Prettier 規則
- 撰寫有意義的測試

### 2. 效能優化
- 實施適當的快取策略
- 使用 React.memo 和 useMemo 優化渲染
- 圖片和PDF壓縮優化

### 3. 安全性
- 驗證所有用戶輸入
- 實施速率限制
- 保護敏感資料

### 4. 用戶體驗
- 提供清楚的錯誤訊息
- 實施載入狀態
- 響應式設計

## 常見問題解決

### Puppeteer 安裝問題
```bash
# 手動安裝 Chromium
npx puppeteer browsers install chrome
```

### 記憶體不足錯誤
```bash
# 增加 Node.js 記憶體限制
node --max-old-space-size=4096 node_modules/.bin/next dev
```

### PDF 生成錯誤
確保圖片格式正確且尺寸合理，必要時進行壓縮處理。