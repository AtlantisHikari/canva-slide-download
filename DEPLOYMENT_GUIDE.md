# Canva Slide Download 部署指南

## 系統概述

Canva Slide Download 是一個高品質的簡報下載工具，整合在 shared-tools 架構中，使用 URL 前綴 `/canva-slide-download` 來避免與其他工具的衝突。

## 技術架構

- **框架**: Next.js 15 + TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **核心功能**: Puppeteer + jsPDF + JSZip
- **狀態管理**: Zustand
- **部署模式**: 前綴路徑模式 (URL Prefix)

## 部署前檢查清單

### 1. 系統依賴

```bash
# Node.js 版本要求
node --version  # >= 18.0.0

# 檢查 Puppeteer 系統依賴 (Linux)
sudo apt-get update
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# macOS (使用 Homebrew)
brew install chromium
```

### 2. 環境變量配置

創建 `.env.local` (本地開發) 或 `.env.production` (生產環境):

```bash
# 生產環境配置
NODE_ENV=production
PORT=3001

# Puppeteer 配置
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 應用配置
BASE_PATH=/canva-slide-download
APP_URL=https://yourdomain.com/canva-slide-download

# 安全配置
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# 日誌配置
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3. 構建配置驗證

```bash
# 檢查構建配置
npm run build

# 檢查類型
npm run type-check

# 檢查代碼品質
npm run lint
```

## 部署方式

### 方式一：獨立部署

```bash
# 1. 安裝依賴
npm ci --production

# 2. 構建應用
npm run build

# 3. 啟動生產服務器
npm run start-prefix
```

### 方式二：整合部署 (推薦)

```bash
# 在 shared-tools 根目錄
cd /path/to/shared-tools

# 啟動所有服務
./start-all-projects.sh
```

### 方式三：Docker 部署

創建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

# 安裝 Puppeteer 依賴
RUN apk add --no-cache \\
    chromium \\
    nss \\
    freetype \\
    freetype-dev \\
    harfbuzz \\
    ca-certificates \\
    ttf-freefont

# 設置 Puppeteer 使用 Alpine 的 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \\
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# 複製依賴文件
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

# 複製應用代碼
COPY . .

# 構建應用
RUN npm run build

# 暴露端口
EXPOSE 3001

# 設置健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3001/canva-slide-download/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 啟動應用
CMD ["npm", "run", "start-prefix"]
```

構建和運行 Docker:

```bash
# 構建鏡像
docker build -t canva-slide-download .

# 運行容器
docker run -d \\
  --name canva-slide-download \\
  -p 3001:3001 \\
  -e NODE_ENV=production \\
  -e BASE_PATH=/canva-slide-download \\
  canva-slide-download
```

## Nginx 反向代理配置

```nginx
# /etc/nginx/sites-available/shared-tools
server {
    listen 80;
    server_name yourdomain.com;

    # Canva Slide Download
    location /canva-slide-download/ {
        proxy_pass http://localhost:3001/canva-slide-download/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 增加超時時間以支持長時間下載
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 其他工具的配置...
}
```

## 性能優化

### 1. Puppeteer 優化

```javascript
// 在 API routes 中的優化配置
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
    '--memory-pressure-off',
    '--max_old_space_size=4096'
  ]
});
```

### 2. 資源限制

```javascript
// next.config.js 中的配置
module.exports = {
  serverRuntimeConfig: {
    maxDuration: 300, // 5 分鐘最大執行時間
  },
  
  // Webpack 優化
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
      });
    }
    return config;
  }
};
```

### 3. 記憶體管理

```bash
# PM2 配置文件 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'canva-slide-download',
    script: 'serve-with-prefix.js',
    instances: 1,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};

# 啟動
pm2 start ecosystem.config.js
```

## 監控和日誌

### 1. 健康檢查端點

```bash
# 健康檢查
curl http://localhost:3001/canva-slide-download/health

# 預期回應
{
  "status": "healthy",
  "service": "canva-slide-download",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "basePath": "/canva-slide-download",
  "version": "1.0.0"
}
```

### 2. 日誌監控

```bash
# 使用 PM2 查看日誌
pm2 logs canva-slide-download

# 或使用 Docker
docker logs canva-slide-download -f
```

### 3. 性能監控

重要指標監控：
- 記憶體使用量 (建議 < 1GB)
- CPU 使用率 (下載期間可能較高)
- 回應時間 (健康檢查 < 100ms)
- 錯誤率 (< 1%)

## 常見問題排除

### 1. Puppeteer 啟動失敗

```bash
# 檢查 Chrome/Chromium 是否可用
which chromium-browser
chromium-browser --version

# 測試 Puppeteer
node -e "const puppeteer = require('puppeteer'); puppeteer.launch().then(browser => { console.log('Puppeteer OK'); browser.close(); })"
```

### 2. 權限問題

```bash
# 確保用戶有權限訪問 Chrome
sudo usermod -a -G audio,video $USER

# 設置正確的文件權限
chmod +x serve-with-prefix.js
```

### 3. 記憶體不足

```bash
# 增加 Node.js 堆內存
export NODE_OPTIONS="--max-old-space-size=4096"

# 或在 package.json 中設置
"start-prefix": "NODE_OPTIONS='--max-old-space-size=4096' PORT=3001 NODE_ENV=production node serve-with-prefix.js"
```

## 部署檢查清單

- [ ] Node.js >= 18.0.0 已安裝
- [ ] 系統依賴已安裝 (Chromium, 字體等)
- [ ] 環境變量已配置
- [ ] npm install 成功執行
- [ ] npm run build 成功執行
- [ ] 健康檢查端點回應正常
- [ ] URL 前綴路由正常工作
- [ ] Puppeteer 可以正常啟動
- [ ] 下載功能測試通過
- [ ] 錯誤處理機制正常
- [ ] 日誌記錄正常
- [ ] 反向代理配置正確
- [ ] 防火牆端口已開放
- [ ] SSL 證書已配置 (生產環境)

## 維護建議

1. **定期更新依賴**: 特別是 Puppeteer 和安全相關套件
2. **監控資源使用**: 設置記憶體和 CPU 告警
3. **日誌輪轉**: 防止日誌文件過大
4. **備份配置**: 定期備份環境配置和部署腳本
5. **性能測試**: 定期進行負載測試

## 支援聯繫

如遇到部署問題，請提供以下信息：
- 操作系統版本
- Node.js 版本
- 錯誤日誌
- 系統資源使用情況
- 網路環境信息