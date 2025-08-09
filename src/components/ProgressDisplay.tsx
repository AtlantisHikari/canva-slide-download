'use client'

import { Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { ProgressDisplayProps } from '@/types'

export default function ProgressDisplay({ progress, onCancel }: ProgressDisplayProps) {
  // Removed helper functions as they're now inline in the JSX

  const getProgressPercentage = () => {
    if (progress.totalPages === 0) return 0
    return Math.round((progress.currentPage / progress.totalPages) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              progress.status === 'complete'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : progress.status === 'error'
                ? 'bg-gradient-to-r from-red-500 to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}>
              {progress.status === 'complete' ? (
                <CheckCircle className="w-7 h-7 text-white" />
              ) : progress.status === 'error' ? (
                <AlertCircle className="w-7 h-7 text-white" />
              ) : (
                <Loader2 className="w-7 h-7 animate-spin text-white" />
              )}
            </div>
            <div>
              <div className={`text-xl font-bold mb-1 ${
                progress.status === 'complete'
                  ? 'text-green-700'
                  : progress.status === 'error'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {progress.message}
              </div>
              {progress.totalPages > 0 && (
                <div className="text-gray-600 font-medium">
                  第 <span className="text-purple-600 font-bold">{progress.currentPage}</span> / <span className="text-purple-600 font-bold">{progress.totalPages}</span> 頁
                </div>
              )}
            </div>
          </div>

          {/* Cancel Button */}
          {onCancel && progress.status !== 'complete' && progress.status !== 'error' && (
            <button
              onClick={onCancel}
              className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl border border-gray-200 hover:border-red-300 transition-all duration-300 font-medium"
              title="取消下載"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">取消</span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {progress.totalPages > 0 && (
          <div className="space-y-4">
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl h-4 shadow-inner">
                <div
                  className={`h-4 rounded-2xl transition-all duration-500 ease-out relative overflow-hidden ${
                    progress.status === 'complete'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : progress.status === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600'
                      : 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  {progress.status !== 'complete' && progress.status !== 'error' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>
              <div className="absolute -top-8 left-0 right-0 flex justify-center">
                <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                  progress.status === 'complete'
                    ? 'bg-green-100 text-green-700'
                    : progress.status === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {getProgressPercentage()}% 完成
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  progress.status === 'complete'
                    ? 'bg-green-500'
                    : progress.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}></div>
                <span className="font-medium">{progress.status === 'complete' ? '完成' : progress.status === 'error' ? '失敗' : '處理中'}</span>
              </div>
              {progress.estimatedTimeRemaining && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">⏱️</span>
                  <span className="font-medium">預估剩餘: {progress.estimatedTimeRemaining}秒</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Details */}
      {progress.status === 'error' && (
        <div className="bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">❌</span>
            </div>
            <h4 className="text-lg font-bold text-red-800">下載失敗</h4>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-red-100">
            <div className="text-red-700 font-medium">
              請檢查網路連線或 Canva 連結是否有效，然後重試。
            </div>
            <div className="mt-3 flex gap-2">
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">🔗 檢查連結</span>
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">🌐 檢查網路</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'complete' && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">✅</span>
            </div>
            <h4 className="text-lg font-bold text-green-800">下載完成</h4>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
            <div className="text-green-700 font-medium mb-3">
              🎉 檔案已成功儲存到您的下載資料夾！
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">📁 查看檔案</span>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">🔄 再次下載</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}