// Fallback functions for static deployment when API routes are not available

export async function parseCanvaUrl(url: string) {
  try {
    // Basic client-side validation for demo
    const urlObj = new URL(url)
    
    if (!(urlObj.hostname === 'www.canva.com' || urlObj.hostname === 'canva.com') || 
        !urlObj.pathname.includes('/design/')) {
      return {
        valid: false,
        error: '請輸入有效的 Canva 設計連結'
      }
    }

    // Extract design ID
    const designId = urlObj.pathname.split('/design/')[1]?.split('/')[0]
    if (!designId) {
      return {
        valid: false,
        error: '無法解析 Canva 設計 ID'
      }
    }

    // For demo purposes, return mock data
    return {
      valid: true,
      title: 'Canva 簡報設計',
      slideCount: 5,
      designId: designId,
      thumbnails: []
    }

  } catch (error) {
    return {
      valid: false,
      error: 'URL 格式無效'
    }
  }
}

export async function downloadCanvaSlides(url: string, options: any) {
  // For static deployment, we can't actually download Canva slides
  // This is a demo version that shows the process but doesn't work
  
  try {
    // Parse the URL
    const result = await parseCanvaUrl(url)
    if (!result.valid) {
      return {
        success: false,
        error: result.error
      }
    }

    // Show a message about functionality limitation
    alert(`📱 Demo 模式說明：

✅ 您輸入的 Canva 連結格式正確
✅ UI/UX 設計和互動功能正常

⚠️  實際下載功能需要後端伺服器支援：
• Puppeteer 截圖引擎
• PDF 生成服務  
• 檔案處理系統

🚀 這個版本主要展示：
• 現代化的使用者介面設計
• 完整的使用者體驗流程
• 響應式互動效果

如需完整功能，請部署到支援 Node.js 的伺服器環境。`)

    return {
      success: false,
      error: 'Demo 版本：完整下載功能需要伺服器環境支援'
    }

  } catch (error) {
    return {
      success: false,
      error: '處理過程發生錯誤'
    }
  }
}