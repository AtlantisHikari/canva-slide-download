#!/usr/bin/env node

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3004;
const basePath = '/canva-slide-download';

// 建立 Next.js 應用
const app = next({ 
  dev, 
  hostname, 
  port,
  conf: {
    basePath: basePath,
    assetPrefix: basePath,
  }
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // 健康檢查端點
      if (pathname === `${basePath}/health`) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          service: 'canva-slide-download',
          timestamp: new Date().toISOString(),
          basePath: basePath,
          version: '1.0.0'
        }));
        return;
      }

      // 檢查請求是否包含正確的前綴
      if (pathname.startsWith(basePath)) {
        // 移除前綴後傳遞給 Next.js
        const newPathname = pathname.replace(basePath, '') || '/';
        req.url = newPathname + (parsedUrl.search || '');
        
        // 設置必要的標頭
        res.setHeader('X-Base-Path', basePath);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        await handle(req, res, parsedUrl);
      } else if (pathname === '/') {
        // 根路徑重定向到帶前綴的路徑
        res.writeHead(302, { 'Location': basePath });
        res.end();
      } else {
        // 其他路徑返回 404
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>404 - 頁面未找到</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
              .container { max-width: 600px; margin: 0 auto; }
              h1 { color: #333; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404 - 頁面未找到</h1>
              <p>請訪問 <a href="${basePath}">Canva Slide Downloader</a></p>
            </div>
          </body>
          </html>
        `);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>500 - 伺服器錯誤</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
          </style>
        </head>
        <body>
          <h1>500 - 伺服器錯誤</h1>
          <p>服務暫時不可用，請稍後再試</p>
        </body>
        </html>
      `);
    }
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`🚀 Canva Slide Downloader 服務已啟動`);
    console.log(`📍 本地訪問: http://localhost:${port}${basePath}`);
    console.log(`📍 IP 訪問: http://0.0.0.0:${port}${basePath}`);
    console.log(`🏥 健康檢查: http://localhost:${port}${basePath}/health`);
    console.log(`⚙️  模式: ${dev ? '開發' : '生產'}`);
    console.log(`⚙️  綁定到所有介面以避免 macOS 限制`);
  });
});