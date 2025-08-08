# Canva Slide Downloader - 部署說明

## 📋 部署版本說明

本專案支援兩種部署方式：

### 🔧 1. 靜態部署 (GitHub Pages)
- ✅ URL 驗證功能
- ✅ 介面展示
- ❌ 實際下載功能（需要伺服器）
- 適合：展示、測試介面

### 🚀 2. 伺服器部署 (推薦)
- ✅ 完整功能
- ✅ 實際 Canva 下載
- ✅ PDF 生成
- ✅ 圖片下載
- 適合：生產使用

## 🌐 推薦部署平台

### 完整功能部署：
1. **Vercel** (推薦)
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Railway**
   ```bash
   railway login
   railway deploy
   ```

3. **Render**
   - 連接 GitHub repository
   - 自動部署

### 靜態展示部署：
1. **GitHub Pages** (目前配置)
2. **Netlify**
3. **Surge**

## ⚡ 本地開發

```bash
# 完整功能 (含 API)
npm run dev-prefix
# 訪問: http://localhost:3004/canva-slide-download

# 或標準模式
npm run dev
# 訪問: http://localhost:3000
```

## 🔧 環境變數

生產部署時需要設定：

```env
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## 📦 功能狀態

| 功能 | 靜態版本 | 伺服器版本 |
|------|----------|------------|
| URL 驗證 | ✅ | ✅ |
| 介面操作 | ✅ | ✅ |
| Canva 截圖 | ❌ | ✅ |
| PDF 生成 | ❌ | ✅ |
| 圖片下載 | ❌ | ✅ |
| 進度追蹤 | ✅ | ✅ |
| 下載歷史 | ✅ | ✅ |

## 🚨 重要提醒

靜態版本僅能展示介面，實際下載功能需要 Node.js 伺服器環境。
建議部署到 Vercel 等平台以獲得完整功能。