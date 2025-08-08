# CLAUDE.md

本檔案為 Claude Code (claude.ai/code) 在此程式庫中工作時提供完整指導。

## 專案資訊

**專案名稱**: canva-slide-download
**版本**: 0.1.0
**描述**: High-quality Canva slide downloader with PDF export functionality
**技術堆疊**: Next.js 15, React 18, TypeScript, Puppeteer, PDF-lib, Tailwind CSS
**資料庫**: 無 (純前端應用)
**架構**: 全端開發 (Next.js API Routes + React 前端)

## 開發環境設定

### 前置需求
- Node.js >= 18.0.0
- npm 或 pnpm
- Git (透過以下指令初始化: `git init`)

### 核心指令
```bash
# 初始設定
git init                     # 初始化 Git repository (必須是第一步)
npm install                  # 安裝相依套件
cp .env.example .env.local   # 複製環境變數

# 開發
npm run dev                  # 啟動開發伺服器
npm run dev-prefix          # 使用 URL 前綴啟動 (PORT=3004 node serve-with-prefix.js)

# 測試
npm run test                # 執行所有測試
npm run test:unit           # 執行單元測試
npm run test:integration    # 執行整合測試
npm run test:e2e           # 執行端對端測試
npm run test:coverage      # 執行測試並產生覆蓋率報告
npm run lint               # 執行程式碼檢查
npm run type-check         # TypeScript 型別檢查

# 正式環境
npm run build              # 建置正式環境版本
npm run start              # 啟動正式環境伺服器
npm run start-prefix       # 使用 URL 前綴啟動正式環境
```

## URL 前綴設定

**重要**: 所有專案必須使用 URL 前綴以避免 Port 衝突。

### 本地開發 URLs
- **基本格式**: `http://localhost:3004/canva-slide-download`
- **本專案**: `http://localhost:3004/canva-slide-download`
- **健康檢查**: `http://localhost:3004/canva-slide-download/health`

### Port 配置
本專案使用 **Port 3004**，符合以下配置：
- Port 3000: 保留給主要專案
- Port 3001: timer-widget (`http://localhost:3001/timer-widget`)
- Port 3002: marquee-tool (`http://localhost:3002/marquee-tool`)
- Port 3003: teleprompter-suite (`http://localhost:3003/teleprompter-suite`)
- **Port 3004: canva-slide-download** (`http://localhost:3004/canva-slide-download`)
- Port 3005: gamma-slide-download (`http://localhost:3005/gamma-slide-download`)
- Port 3006: slideshare-slide-download (`http://localhost:3006/slideshare-slide-download`)
- Port 3007: rss-reader (`http://localhost:3007/rss-reader`)
- Port 3008: pic-snapshot (`http://localhost:3008/pic-snapshot`)

### 前綴實作
```javascript
// serve-with-prefix.js 配置
const port = parseInt(process.env.PORT, 10) || 3004;
const basePath = '/canva-slide-download';

const app = next({ 
  dev, 
  hostname, 
  port,
  conf: {
    basePath: basePath,
    assetPrefix: basePath,
  }
});
```

## 開發流程

### 1. 專案初始化
```bash
# 任何新專案的必要首要步驟
git init
git add .
git commit -m "Initial commit

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 設定開發環境
npm install
cp .env.example .env.local  # 配置環境變數
```

### 2. 開發前檢查清單
- [ ] Git repository 初始化完成
- [ ] URL 前綴配置正確 (/canva-slide-download)
- [ ] Port 配置確認 (3004，無衝突)
- [ ] 環境變數配置完成 (.env.local)
- [ ] 相依套件安裝完成
- [ ] 健康檢查端點運作正常

### 3. 開發流程
1. **功能開發**
   - 建立功能分支: `git checkout -b feature/[feature-name]`
   - 使用前綴執行開發伺服器: `npm run dev-prefix`
   - 驗證 URL: `http://localhost:3004/canva-slide-download`
   - 依照既有模式實作功能

2. **程式品質保證**
   - 執行程式碼檢查: `npm run lint`
   - 執行型別檢查: `npm run type-check`
   - 在提交前修復所有問題

3. **測試協議**
   - 單元測試: `npm run test:unit`
   - 整合測試: `npm run test:integration`
   - E2E 測試: `npm run test:e2e` 
   - 覆蓋率報告: `npm run test:coverage`

### 4. 提交前驗證
```bash
# 提交前必須通過所有檢查
npm run lint                # ESLint 檢查
npm run type-check         # TypeScript 驗證
npm run test               # 所有測試
npm run build              # 正式環境建置驗證
```

### 5. 正式環境部署
```bash
# 建置並驗證
npm run build
npm run start-prefix       # 在本地測試正式環境建置

# 健康檢查驗證
curl http://localhost:3004/canva-slide-download/health
```

## 測試策略

### 測試結構
```
tests/
├── unit/                  # 元件和工具測試
├── integration/           # API 和工作流程測試
├── e2e/                  # 端對端使用者流程測試
├── fixtures/             # 測試資料和模擬
├── helpers/              # 測試工具
└── config/               # 測試配置
```

### 測試指令
- `npm run test:unit` - 元件/工具的快速單元測試
- `npm run test:integration` - API 和服務整合測試
- `npm run test:e2e` - 完整使用者工作流程測試 (Playwright)
- `npm run test:coverage` - 覆蓋率報告 (目標 >80%)
- `npm run test:ci` - CI 最佳化測試套件

### 測試最佳實務
1. **單元測試**: 測試個別元件和函式
2. **整合測試**: 測試 API 端點和服務互動
3. **E2E 測試**: 測試完整使用者工作流程
4. **覆蓋率**: 維持 >80% 程式碼覆蓋率
5. **效能**: 包含效能基準測試 (如適用)

## 程式碼品質標準

### TypeScript 配置
- 啟用嚴格模式
- 不允許隱式 any
- 標記未使用的變數/匯入
- 函式需要回傳型別註解

### ESLint 規則
- 擴展 Next.js 配置
- TypeScript ESLint 解析器
- 儲存時自動格式化

### 檔案結構慣例
```
src/
├── app/                   # Next.js App Router 頁面
│   ├── api/              # API 路由 (download, parse, progress)
│   ├── globals.css       # 全域樣式
│   ├── layout.tsx        # 應用程式佈局
│   └── page.tsx          # 主頁面
├── components/           # React 元件
│   ├── ui/              # 可重複使用的 UI 元件
│   ├── DownloadOptions.tsx
│   ├── ProgressDisplay.tsx
│   ├── UrlInput.tsx
│   └── HistoryList.tsx  
├── lib/                  # 工具和服務
│   ├── canva-parser.ts   # Canva URL 解析器
│   ├── downloader.ts     # 下載管理器
│   ├── pdf-generator.ts  # PDF 生成器
│   ├── screenshot-engine.ts # 截圖引擎
│   └── progress-tracker.ts # 進度追蹤器
└── types/               # TypeScript 型別定義
    └── index.ts         # 主要型別定義
```

## 環境配置

### 必要環境變數
```bash
# 從 .env.example 複製到 .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3004/canva-slide-download

# 效能設定
MAX_CONCURRENT_DOWNLOADS=3
SCREENSHOT_TIMEOUT=30000
PUPPETEER_MEMORY_LIMIT=512

# 瀏覽器配置
PUPPETEER_HEADLESS=true
PUPPETEER_DISABLE_GPU=true
PUPPETEER_NO_SANDBOX=true

# 功能開關
ENABLE_BATCH_DOWNLOAD=true
ENABLE_QUALITY_PRESETS=true
ENABLE_PROGRESS_TRACKING=true
ENABLE_DOWNLOAD_HISTORY=true
MAX_PAGES_PER_DOWNLOAD=50
MAX_FILE_SIZE_MB=100
```

### 安全最佳實務
- 永不將機密資訊提交到 Git
- 僅在客戶端安全的變數使用 NEXT_PUBLIC_ 前綴
- 在啟動時驗證環境變數
- 使用適當的 CORS 配置
- 為 APIs 實作速率限制

## 專案特色功能

### 核心功能
- **Canva URL 解析**: 智慧解析 Canva 簡報連結
- **高品質截圖**: 使用 Puppeteer 擷取高解析度圖片
- **PDF 匯出**: 將多張投影片整合為單一 PDF 檔案
- **批次下載**: 支援同時下載多張投影片
- **進度追蹤**: 即時顯示下載進度
- **下載歷史**: 記錄使用者下載歷史

### 技術架構
- **前端**: Next.js 15 + React 18 + TypeScript
- **樣式**: Tailwind CSS + shadcn/ui
- **狀態管理**: Zustand
- **截圖引擎**: Puppeteer
- **PDF 處理**: PDF-lib + jsPDF
- **動畫**: Framer Motion
- **測試**: Jest + Playwright + Testing Library

## 常見問題與解決方案

### Port 衝突
**問題**: 多個專案嘗試使用相同 Port
**解決方案**: 始終使用 Port 3004 和 URL 前綴 /canva-slide-download
```bash
# 檢查 Port 是否被使用
lsof -i :3004

# 終止使用 Port 的程序
kill -9 $(lsof -t -i:3004)
```

### 截圖問題
**常見原因**:
- Puppeteer 權限問題: 檢查 PUPPETEER_NO_SANDBOX 設定
- 記憶體不足: 調整 PUPPETEER_MEMORY_LIMIT
- 超時錯誤: 增加 SCREENSHOT_TIMEOUT 值
- Canva 防護機制: 調整 User-Agent 和等待時間

### 下載失敗
**解決步驟**:
1. 檢查 Canva URL 格式是否正確
2. 確認網路連線狀態
3. 檢查瀏覽器無頭模式設定
4. 驗證 Canva 頁面載入狀態
5. 確認檔案大小未超過限制

## 效能最佳化

### 截圖最佳化
- 使用適當的螢幕尺寸和設備像素比
- 啟用 GPU 加速 (生產環境)
- 設定適當的記憶體限制
- 實作併發控制避免資源耗盡

### 下載最佳化
- 實作智慧重試機制
- 使用壓縮演算法減少傳輸大小
- 實作快取機制避免重複下載
- 分批處理大量下載請求

## 部署考量

### 正式環境檢查清單
- [ ] 環境變數配置完成
- [ ] Puppeteer 相依性安裝完成
- [ ] 建置程序成功
- [ ] 健康檢查端點回應正常
- [ ] 記憶體和 CPU 限制設定適當
- [ ] 錯誤監控設定完成

### 健康檢查實作
```typescript
// api/health/route.ts - 已在 serve-with-prefix.js 中實作
// 回應格式:
{
  "status": "healthy",
  "service": "canva-slide-download", 
  "timestamp": "2025-01-01T00:00:00.000Z",
  "basePath": "/canva-slide-download",
  "version": "0.1.0"
}
```

## 監控與日誌記錄

### 應用程式監控
- 健康檢查端點 (/health)
- 下載成功率追蹤
- 截圖效能監控
- 錯誤率和類型分析

### 開發日誌記錄
```javascript
// 使用結構化日誌記錄
console.log(`🚀 Canva Slide Downloader 服務已啟動`);
console.log(`📍 本地訪問: http://localhost:3004/canva-slide-download`);
console.log(`🏥 健康檢查: http://localhost:3004/canva-slide-download/health`);
console.log(`⚙️ 模式: ${dev ? '開發' : '生產'}`);
```

## Claude Code 注意事項

### 專案內容
這是一個高品質的 Canva 投影片下載器。重點關注領域:
- Canva URL 解析和驗證
- 高解析度截圖擷取
- PDF 生成和最佳化
- 使用者體驗和進度回饋
- 下載效能最佳化

### 開發優先順序
1. **安全性**: 永不提交機密資訊，驗證輸入
2. **效能**: 為速度和效率進行最佳化
3. **可維護性**: 遵循既定模式
4. **測試**: 全面的測試覆蓋率
5. **文件**: 保持文件更新

### 整合點
- Puppeteer 瀏覽器自動化
- PDF-lib 和 jsPDF PDF 處理
- Next.js API Routes 後端邏輯
- Zustand 狀態管理
- Tailwind CSS + shadcn/ui 介面

記住: 在任何提交或建置前，始終執行 `npm run lint` 和 `npm run type-check`。