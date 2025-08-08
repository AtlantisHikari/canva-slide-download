import { NextRequest, NextResponse } from 'next/server'

interface ParseRequest {
  url: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ParseRequest = await request.json()
    const { url } = body

    // 基本 URL 驗證
    if (!isValidCanvaUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid Canva URL format', valid: false },
        { status: 400 }
      )
    }

    // 提取設計 ID
    const designId = extractDesignId(url)
    if (!designId) {
      return NextResponse.json(
        { error: 'Unable to extract design ID', valid: false },
        { status: 400 }
      )
    }

    // 基本 URL 格式驗證通過後，直接認為有效
    // 真正的內容驗證將在下載時進行
    console.log('Validating Canva URL:', { url, designId })
    
    // 成功驗證 - 基於 URL 格式和設計 ID 存在
    return NextResponse.json({
      valid: true,
      title: `Canva Design ${designId.slice(0, 8)}`,
      slideCount: 1, // 默認為 1 頁，實際下載時會檢測
      url,
      designId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to parse Canva URL', 
        valid: false,
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

function isValidCanvaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      (urlObj.hostname === 'www.canva.com' || urlObj.hostname === 'canva.com') &&
      urlObj.pathname.includes('/design/')
    )
  } catch {
    return false
  }
}

function extractDesignId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const designIndex = pathParts.indexOf('design')
    
    if (designIndex !== -1 && pathParts[designIndex + 1]) {
      return pathParts[designIndex + 1]
    }
    
    return null
  } catch {
    return null
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Canva URL Parser API is ready',
    version: '1.0.0'
  })
}