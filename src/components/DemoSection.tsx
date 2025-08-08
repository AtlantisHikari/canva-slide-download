'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, ExternalLink, FileText, Download } from 'lucide-react'

export default function DemoSection() {
  const [showDemo, setShowDemo] = useState(false)

  const demoSteps = [
    {
      title: '輸入 Canva 連結',
      description: '貼上任何公開的 Canva 簡報連結',
      example: 'https://www.canva.com/design/DAFxxxxx/view'
    },
    {
      title: '選擇品質設定',
      description: '選擇適合的畫質和檔案格式',
      example: '高品質 PDF (推薦)'
    },
    {
      title: '一鍵下載',
      description: '點擊下載按鈕，等待處理完成',
      example: '通常 2-5 分鐘完成'
    },
    {
      title: '獲得檔案',
      description: '下載高品質 PDF 或圖片壓縮包',
      example: '保持原始設計品質'
    }
  ]

  const exampleDesigns = [
    {
      title: '商業簡報模板',
      description: '專業的商業提案簡報',
      thumbnail: '/api/placeholder/300/200',
      url: '#demo1'
    },
    {
      title: '教育培訓資料',
      description: '互動式學習簡報',
      thumbnail: '/api/placeholder/300/200', 
      url: '#demo2'
    },
    {
      title: '產品介紹',
      description: '創意產品展示簡報',
      thumbnail: '/api/placeholder/300/200',
      url: '#demo3'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Demo Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          如何使用
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          只需幾個簡單步驟，就能將 Canva 簡報下載為高品質檔案
        </p>

        <button
          onClick={() => setShowDemo(!showDemo)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlayCircle className="w-5 h-5" />
          {showDemo ? '隱藏演示' : '觀看演示'}
        </button>
      </motion.div>

      {/* Demo Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showDemo ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {demoSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
              {index + 1}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3">
              {step.description}
            </p>
            
            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
              {step.example}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Designs */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            範例簡報
          </h3>
          <p className="text-gray-600">
            試試這些範例 Canva 簡報連結
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exampleDesigns.map((design, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {design.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {design.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    試用下載
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 使用小貼士
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <p>• 確保 Canva 簡報為公開狀態</p>
            <p>• 使用 /view 連結效果最佳</p>
            <p>• 高品質設定適合列印使用</p>
          </div>
          <div className="space-y-2">
            <p>• 支援最多 50 頁簡報</p>
            <p>• PDF 檔案包含完整設計</p>
            <p>• 所有處理均在本地完成</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}