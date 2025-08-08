# Canva Slide Downloader - Development Guide

## 🚀 快速開始

### 1. 環境要求
- Node.js 18.0.0 或更高版本
- npm 或 pnpm
- Chrome/Chromium (Puppeteer 自動安裝)

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境配置
複製並配置環境變量：
```bash
cp .env.example .env.local
```

### 4. 啟動開發服務器
```bash
npm run dev
```

服務器將在 http://localhost:3000 啟動

## 🏗️ 專案架構

### 核心模組
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   │   ├── parse/      # URL 解析 API
│   │   ├── download/   # 下載 API
│   │   └── progress/   # 進度追蹤 API
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 主頁面
│   └── globals.css     # 全局樣式
├── components/         # React 組件
│   ├── UrlInput.tsx           # URL 輸入組件
│   ├── DownloadOptions.tsx    # 下載選項組件
│   ├── ProgressDisplay.tsx    # 進度顯示組件
│   └── HistoryList.tsx        # 下載記錄組件
├── lib/                # 核心功能庫
│   ├── canva-parser.ts        # Canva URL 解析器
│   ├── screenshot-engine.ts   # 截圖引擎
│   ├── pdf-generator.ts       # PDF 生成器
│   ├── downloader.ts          # 下載管理器
│   ├── progress-tracker.ts    # 進度追蹤器
│   └── store.ts               # 狀態管理
└── types/              # TypeScript 類型定義
    └── index.ts
```

### 技術棧
- **前端**: Next.js 15 + React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **截圖**: Puppeteer
- **PDF 生成**: jsPDF + pdf-lib
- **狀態管理**: Zustand
- **圖片處理**: Sharp

## 🔧 核心功能

### 1. URL 解析器 (`canva-parser.ts`)
- 驗證 Canva URL 格式
- 提取設計 ID 和頁面數量
- 檢測簡報類型和權限

### 2. 截圖引擎 (`screenshot-engine.ts`)
- 使用 Puppeteer 進行高解析度截圖
- 支援多種畫質設定
- 自動頁面導航和等待

### 3. PDF 生成器 (`pdf-generator.ts`)
- 支援 jsPDF 和 pdf-lib 兩種引擎
- 自動頁面佈局和尺寸計算
- 壓縮和品質優化

### 4. 下載管理器 (`downloader.ts`)
- 統一的下載流程管理
- 進度追蹤和錯誤處理
- 支援批次下載

## 🧪 測試

### 基本功能測試
```bash
node test-basic-functionality.js
```

### 單元測試
```bash
npm test
```

### 端到端測試
```bash
npm run test:e2e
```

## 📝 API 文檔

### POST /api/parse
解析 Canva URL 並返回設計資訊
```json
{
  "url": "https://www.canva.com/design/DAFxxxxx/view"
}
```

### POST /api/download
下載 Canva 簡報
```json
{
  "url": "https://www.canva.com/design/DAFxxxxx/view",
  "options": {
    "quality": "high",
    "format": "pdf",
    "includeMetadata": true,
    "compression": 85
  },
  "jobId": "optional-job-id"
}
```

### GET /api/progress?jobId=xxx
獲取下載進度

## 🔍 調試

### 啟用調試模式
在 `.env.local` 中設置：
```
DEBUG_MODE=true
LOG_LEVEL=debug
```

### Puppeteer 調試
```
PUPPETEER_HEADLESS=false
```

### 常見問題

#### 1. Puppeteer 安裝問題
```bash
# 重新安裝 Puppeteer
npm uninstall puppeteer
npm install puppeteer
```

#### 2. 記憶體不足
```bash
# 增加 Node.js 記憶體限制
node --max-old-space-size=4096 node_modules/.bin/next dev
```

#### 3. 截圖失敗
- 檢查 Canva URL 是否公開
- 確認網路連接正常
- 檢查 Puppeteer Chrome 路徑

## 🚀 部署

### Vercel 部署
1. 推送到 GitHub
2. 連接 Vercel
3. 配置環境變量
4. 部署

### Docker 部署
```bash
# 構建鏡像
docker build -t canva-downloader .

# 運行容器
docker run -p 3000:3000 canva-downloader
```

## 📊 性能優化

### 1. 截圖優化
- 使用適當的畫質設定
- 啟用請求攔截以過濾不必要資源
- 設置合理的等待時間

### 2. 記憶體管理
- 及時清理 Puppeteer 實例
- 限制並發下載數量
- 使用流式處理大檔案

### 3. 緩存策略
- URL 解析結果緩存
- 圖片處理結果緩存
- API 響應緩存

## 🛡️ 安全考慮

### 1. 輸入驗證
- 嚴格的 URL 格式驗證
- 檔案大小限制
- 請求頻率限制

### 2. 資源保護
- 禁用不必要的 Puppeteer 功能
- 沙箱模式運行
- 超時設置

### 3. 隱私保護
- 本地處理，不存儲用戶數據
- 臨時檔案自動清理
- 不記錄敏感資訊

## 📈 監控和分析

### 1. 性能監控
- 下載時間統計
- 記憶體使用監控
- 錯誤率追蹤

### 2. 用戶分析
- 下載量統計
- 熱門簡報類型
- 用戶反饋收集

## 🔄 版本更新

### 依賴更新
```bash
# 檢查過時依賴
npm outdated

# 更新依賴
npm update
```

### 功能更新
- 新增畫質選項
- 支援更多檔案格式
- UI/UX 改進

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 創建 Pull Request

## 📞 技術支援

如有問題，請查看：
1. 常見問題解答
2. GitHub Issues
3. 技術文檔

---

**Canva Slide Downloader** - 高品質簡報下載工具 🎨📄