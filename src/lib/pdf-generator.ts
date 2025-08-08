import jsPDF from 'jspdf'
import { PDFDocument, rgb } from 'pdf-lib'
import sharp from 'sharp'
import type { PdfOptions, PdfMetadata, DownloadOptions, DEFAULT_PDF_OPTIONS } from '@/types'

export class PdfGenerator {
  private options: PdfOptions

  constructor(options: Partial<PdfOptions> = {}) {
    this.options = { ...DEFAULT_PDF_OPTIONS, ...options }
  }

  async generateFromImages(
    images: Buffer[], 
    metadata?: Partial<PdfMetadata>,
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<Buffer> {
    try {
      onProgress?.(0, images.length, '正在初始化 PDF...')

      // Use pdf-lib for better quality and control
      const pdfDoc = await PDFDocument.create()

      // Set PDF metadata
      if (metadata) {
        pdfDoc.setTitle(metadata.title || 'Canva Slides')
        pdfDoc.setAuthor(metadata.author || 'Canva Slide Downloader')
        pdfDoc.setCreator(metadata.creator || 'Canva Slide Downloader')
        pdfDoc.setCreationDate(metadata.creationDate || new Date())
      }

      for (let i = 0; i < images.length; i++) {
        onProgress?.(i + 1, images.length, `正在處理第 ${i + 1} 頁...`)

        try {
          // Process image with Sharp for optimization
          const processedImage = await this.processImage(images[i])
          
          // Add image to PDF
          await this.addImageToPdf(pdfDoc, processedImage, i)

        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error)
          // Continue with other images even if one fails
        }

        // Small delay to prevent blocking
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      onProgress?.(images.length, images.length, '正在生成 PDF 文件...')

      // Generate PDF buffer
      const pdfBytes = await pdfDoc.save()
      
      onProgress?.(images.length, images.length, 'PDF 生成完成！')
      
      return Buffer.from(pdfBytes)

    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`PDF 生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  private async processImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata()
      
      // Calculate target dimensions based on PDF page size
      const pageDimensions = this.getPageDimensions()
      const targetWidth = pageDimensions.width - (this.options.margin.left + this.options.margin.right)
      const targetHeight = pageDimensions.height - (this.options.margin.top + this.options.margin.bottom)

      // Calculate scaling to fit within margins while maintaining aspect ratio
      const aspectRatio = (metadata.width || 1) / (metadata.height || 1)
      let finalWidth = targetWidth
      let finalHeight = targetWidth / aspectRatio

      if (finalHeight > targetHeight) {
        finalHeight = targetHeight
        finalWidth = targetHeight * aspectRatio
      }

      // Process image with Sharp
      const processedBuffer = await sharp(imageBuffer)
        .resize(Math.round(finalWidth), Math.round(finalHeight), {
          fit: 'inside',
          withoutEnlargement: false
        })
        .png({ 
          quality: this.options.quality,
          compressionLevel: 9,
          progressive: true
        })
        .toBuffer()

      return processedBuffer

    } catch (error) {
      console.error('Image processing error:', error)
      // Return original buffer if processing fails
      return imageBuffer
    }
  }

  private async addImageToPdf(pdfDoc: PDFDocument, imageBuffer: Buffer, pageIndex: number): Promise<void> {
    try {
      // Embed image in PDF
      const image = await pdfDoc.embedPng(imageBuffer)
      
      // Add a new page
      const pageDimensions = this.getPageDimensions()
      const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height])

      // Calculate image dimensions and position
      const imageDims = image.scale(1) // Get original dimensions
      const availableWidth = pageDimensions.width - (this.options.margin.left + this.options.margin.right)
      const availableHeight = pageDimensions.height - (this.options.margin.top + this.options.margin.bottom)

      // Scale image to fit within margins
      const scale = Math.min(
        availableWidth / imageDims.width,
        availableHeight / imageDims.height
      )

      const scaledWidth = imageDims.width * scale
      const scaledHeight = imageDims.height * scale

      // Center the image on the page
      const x = this.options.margin.left + (availableWidth - scaledWidth) / 2
      const y = this.options.margin.bottom + (availableHeight - scaledHeight) / 2

      // Draw the image
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight
      })

      // Optionally add page number
      if (pageIndex >= 0) {
        page.drawText(`${pageIndex + 1}`, {
          x: pageDimensions.width - this.options.margin.right - 30,
          y: this.options.margin.bottom / 2,
          size: 10,
          color: rgb(0.5, 0.5, 0.5)
        })
      }

    } catch (error) {
      console.error('Error adding image to PDF:', error)
      throw error
    }
  }

  private getPageDimensions(): { width: number; height: number } {
    const sizes = {
      'A4': { width: 595.28, height: 841.89 },
      'Letter': { width: 612, height: 792 },
      'Custom': { width: 800, height: 600 }
    }

    const dimensions = sizes[this.options.pageSize] || sizes.A4

    // Swap dimensions for landscape
    if (this.options.orientation === 'landscape') {
      return { width: dimensions.height, height: dimensions.width }
    }

    return dimensions
  }

  // Alternative method using jsPDF for different use cases
  async generateWithJsPDF(
    images: Buffer[],
    metadata?: Partial<PdfMetadata>,
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<Buffer> {
    try {
      onProgress?.(0, images.length, '正在初始化 PDF (jsPDF)...')

      const orientation = this.options.orientation === 'landscape' ? 'l' : 'p'
      const unit = 'pt'
      const format = this.options.pageSize.toLowerCase()

      const doc = new jsPDF({
        orientation,
        unit,
        format
      })

      // Set metadata
      if (metadata) {
        doc.setProperties({
          title: metadata.title || 'Canva Slides',
          author: metadata.author || 'Canva Slide Downloader',
          creator: metadata.creator || 'Canva Slide Downloader'
        })
      }

      for (let i = 0; i < images.length; i++) {
        onProgress?.(i + 1, images.length, `正在添加第 ${i + 1} 頁...`)

        if (i > 0) {
          doc.addPage()
        }

        try {
          // Convert buffer to base64 data URL
          const base64 = images[i].toString('base64')
          const dataUrl = `data:image/png;base64,${base64}`

          // Get page dimensions
          const pageWidth = doc.internal.pageSize.getWidth()
          const pageHeight = doc.internal.pageSize.getHeight()

          // Calculate image placement with margins
          const marginX = this.options.margin.left
          const marginY = this.options.margin.top
          const availableWidth = pageWidth - this.options.margin.left - this.options.margin.right
          const availableHeight = pageHeight - this.options.margin.top - this.options.margin.bottom

          // Add image to PDF
          doc.addImage(
            dataUrl,
            'PNG',
            marginX,
            marginY,
            availableWidth,
            availableHeight,
            undefined,
            'FAST'
          )

        } catch (error) {
          console.error(`Error adding image ${i + 1} to jsPDF:`, error)
        }
      }

      onProgress?.(images.length, images.length, '正在生成 PDF 文件...')

      // Generate PDF buffer
      const pdfOutput = doc.output('arraybuffer')
      
      onProgress?.(images.length, images.length, 'PDF 生成完成！')
      
      return Buffer.from(pdfOutput)

    } catch (error) {
      console.error('jsPDF generation error:', error)
      throw new Error(`PDF 生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
}

// Utility functions
export async function generatePdfFromImages(
  images: Buffer[],
  options: DownloadOptions,
  metadata?: Partial<PdfMetadata>,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Buffer> {
  const pdfOptions: PdfOptions = {
    pageSize: 'A4',
    orientation: 'landscape', // Most presentations are landscape
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    quality: options.compression || 85,
    title: metadata?.title,
    author: metadata?.author
  }

  const generator = new PdfGenerator(pdfOptions)
  return await generator.generateFromImages(images, metadata, onProgress)
}

export function calculatePdfSize(imageCount: number, quality: number): number {
  // Rough estimate: each high-quality image is ~500KB in PDF
  const baseSize = imageCount * 500 * 1024 // 500KB per image
  const qualityFactor = quality / 100
  return Math.round(baseSize * qualityFactor)
}