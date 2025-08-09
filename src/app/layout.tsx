import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './force-colors.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Canva Slide Downloader | 高品質簡報下載工具',
  description: '專業的 Canva 簡報下載工具，支援高品質 PDF 匯出、批次處理和多種格式。完全免費，隱私安全，本地處理。',
  keywords: [
    'canva', 'slide', 'download', 'pdf', 'presentation', 
    'canva下載', '簡報下載', '投影片', '高品質PDF', '批次下載',
    'canva工具', '免費下載', '繁體中文'
  ],
  authors: [{ name: 'Canva Slide Downloader Team' }],
  creator: 'Canva Slide Downloader',
  publisher: 'Canva Slide Downloader',
  robots: 'index, follow',
  openGraph: {
    title: 'Canva Slide Downloader | 專業簡報下載工具',
    description: '高品質 Canva 簡報下載，支援 PDF 匯出和批次處理。完全免費，隱私安全。',
    type: 'website',
    locale: 'zh_TW',
    siteName: 'Canva Slide Downloader',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canva Slide Downloader | 專業簡報下載工具',
    description: '高品質 Canva 簡報下載，支援 PDF 匯出和批次處理。完全免費，隱私安全。',
    creator: '@canvadownloader',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004/canva-slide-download',
  },
  category: 'technology',
  classification: 'Business Tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} font-sans`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 relative">
          {/* Background Pattern */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-white to-purple-100/20 pointer-events-none" />
          <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Floating Elements for Visual Interest */}
          <div className="fixed top-20 left-10 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl pointer-events-none animate-float" />
          <div className="fixed bottom-32 right-16 w-12 h-12 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-lg pointer-events-none animate-float animation-delay-500" />
          <div className="fixed top-1/3 right-8 w-8 h-8 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-md pointer-events-none animate-float animation-delay-700" />
        </div>
      </body>
    </html>
  )
}