import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

interface DownloadRequest {
  url: string
  options: {
    quality: 'high' | 'medium' | 'low'
    format: 'pdf' | 'images'
    includeMetadata: boolean
    compression: number
  }
  jobId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: DownloadRequest = await request.json()
    const { url, options } = body

    // 驗證 Canva URL
    if (!url.includes('canva.com/design/')) {
      return NextResponse.json(
        { error: 'Invalid Canva URL' },
        { status: 400 }
      )
    }

    // 啟動 Puppeteer
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
        '--disable-gpu'
      ]
    })

    try {
      const page = await browser.newPage()
      
      // 設置視窗大小
      await page.setViewport({ width: 1920, height: 1080 })
      
      // 導航到 Canva 頁面
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      })

      // 等待內容載入
      await page.waitForSelector('canvas, svg, img', { timeout: 30000 })

      // 截圖
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
        quality: options.quality === 'high' ? 100 : options.quality === 'medium' ? 80 : 60
      })

      if (options.format === 'pdf') {
        // 創建 PDF
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        
        // 將截圖嵌入 PDF
        const pngImage = await pdfDoc.embedPng(screenshot)
        const pngDims = pngImage.scale(0.5)
        
        page.drawImage(pngImage, {
          x: 0,
          y: page.getHeight() - pngDims.height,
          width: pngDims.width,
          height: pngDims.height,
        })

        // 添加元數據
        if (options.includeMetadata) {
          pdfDoc.setTitle('Canva Presentation')
          pdfDoc.setCreator('Canva Slide Downloader')
          pdfDoc.setCreationDate(new Date())
        }

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(pdfBytes, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="canva-slides.pdf"',
          },
        })
      } else {
        // 返回圖片壓縮包
        const zip = new JSZip()
        zip.file('slide-1.png', screenshot)

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

        return new NextResponse(zipBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="canva-slides.zip"',
          },
        })
      }

    } finally {
      await browser.close()
    }

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Canva Slide Download API is ready',
    version: '1.0.0'
  })
}