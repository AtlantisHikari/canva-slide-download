'use client'

import { useState } from 'react'
import { 
  Download, 
  Trash2, 
  FileText, 
  Calendar, 
  HardDrive, 
  Hash,
  ExternalLink,
  MoreVertical,
  Copy,
  CheckCircle
} from 'lucide-react'
import type { HistoryListProps } from '@/types'

export default function HistoryList({ history, onRedownload, onDelete }: HistoryListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-10 h-10 text-blue-500" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          尚無下載記錄
        </h3>
        
        <p className="text-gray-600">
          開始下載 Canva 簡報後，記錄會顯示在這裡
        </p>
        
        <div className="mt-6 text-xs text-blue-600 bg-blue-50 rounded-lg px-4 py-2 inline-block">
          💡 小貼士：每次下載都會自動記錄，方便您管理
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          共 <span className="font-bold text-blue-600">{history.length}</span> 筆下載記錄
        </p>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {item.url}
                    </p>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                        <button
                          onClick={() => {
                            onRedownload(item)
                            setOpenMenuId(null)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          重新下載
                        </button>
                        
                        <button
                          onClick={() => {
                            copyUrl(item.url, item.id)
                            setOpenMenuId(null)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              已複製
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              複製連結
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            openUrl(item.url)
                            setOpenMenuId(null)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <ExternalLink className="w-4 h-4" />
                          開啟原檔
                        </button>
                        
                        <hr className="my-1" />
                        
                        <button
                          onClick={() => {
                            onDelete(item.id)
                            setOpenMenuId(null)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          刪除記錄
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span>{item.pageCount} 頁</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    <span>{formatFileSize(item.fileSize)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.downloadedAt)}</span>
                  </div>
                </div>

                {/* Options Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.options.quality === 'ultra' 
                      ? 'bg-purple-100 text-purple-800'
                      : item.options.quality === 'high'
                      ? 'bg-blue-100 text-blue-800'
                      : item.options.quality === 'medium'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.options.quality === 'ultra' ? '超高品質' :
                     item.options.quality === 'high' ? '高品質' :
                     item.options.quality === 'medium' ? '中品質' : '低品質'}
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.options.format === 'pdf' ? 'PDF' : '圖片'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  )
}