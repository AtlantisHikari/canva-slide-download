# 🚀 GitHub Pages 部署指南

## 📋 完整部署步驟

### 1. 推送程式碼到 GitHub

如果還沒推送，請執行：

```bash
# 確認 remote 設定
git remote -v

# 推送到 GitHub
git push -u origin main
```

### 2. 啟用 GitHub Pages

1. **前往您的 GitHub Repository**：
   https://github.com/AtlantisHikari/canva-slide-download

2. **進入 Settings**：
   - 點擊 repository 頂部的 "Settings" 標籤

3. **設定 GitHub Pages**：
   - 在左側選單找到 "Pages"
   - **Source**: 選擇 "GitHub Actions" 
   - ✅ 這會自動使用我們的 `.github/workflows/deploy.yml`

4. **等待部署完成**：
   - 前往 "Actions" 標籤查看部署進度
   - 綠色勾號表示部署成功

### 3. 訪問您的網站

部署完成後，網站將在以下網址上線：

```
https://atlantishikari.github.io/canva-slide-download/
```

## ⚡ 自動部署

✅ 已設定自動部署：
- 每次推送到 `main` 分支時自動觸發
- 使用 Next.js 15 優化的建置流程
- 自動生成靜態檔案到 GitHub Pages

## 🔍 驗證清單

部署完成後，請確認：

- [ ] 網站能正常開啟
- [ ] URL 驗證功能正常運作
- [ ] UI 介面顯示完整
- [ ] 能看到 "GitHub Pages 展示版本" 標示
- [ ] 表單提交顯示適當的訊息（告知需要伺服器部署才能實際下載）

## 🚨 GitHub Pages 版本限制

**✅ 可用功能：**
- UI 介面展示
- Canva URL 格式驗證
- 設定選項展示
- 下載歷史（本地儲存）

**❌ 不可用功能：**
- 實際 Canva 截圖下載
- PDF 生成
- 伺服器端處理

## 🎯 獲得完整功能

想要完整的下載功能，請部署到：

### 1. Vercel (推薦)
```bash
npm i -g vercel
vercel --prod
```

### 2. Railway
```bash
railway login
railway deploy
```

### 3. Render
- 連接 GitHub repository
- 自動部署

## 📊 部署狀態

查看部署狀態：
- GitHub Actions: https://github.com/AtlantisHikari/canva-slide-download/actions
- Live Site: https://atlantishikari.github.io/canva-slide-download/

## 🛠️ 疑難排解

**部署失敗？**
1. 檢查 Actions 標籤中的錯誤訊息
2. 確認 `package.json` 中的 scripts 正確
3. 確認 `next.config.js` 設定正確

**網站無法開啟？**
1. 確認 GitHub Pages 已啟用
2. 等待 DNS 傳播（最多 10 分鐘）
3. 嘗試無痕模式開啟

**樣式或功能異常？**
1. 檢查瀏覽器開發者工具的錯誤
2. 確認所有靜態資源載入正常
3. 清除瀏覽器快取

---

🎉 **恭喜！** 您的 Canva Slide Downloader 即將在 GitHub Pages 上線！