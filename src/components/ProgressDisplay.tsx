'use client'

import { Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { ProgressDisplayProps } from '@/types'

export default function ProgressDisplay({ progress, onCancel }: ProgressDisplayProps) {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'complete':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
    }
  }

  const getProgressPercentage = () => {
    if (progress.totalPages === 0) return 0
    return Math.round((progress.currentPage / progress.totalPages) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className={`font-medium ${getStatusColor()}`}>
              {progress.message}
            </div>
            {progress.totalPages > 0 && (
              <div className="text-sm text-gray-600">
                第 {progress.currentPage} / {progress.totalPages} 頁
              </div>
            )}
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && progress.status !== 'complete' && progress.status !== 'error' && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="取消下載"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {progress.totalPages > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.status === 'complete'
                  ? 'bg-green-600'
                  : progress.status === 'error'
                  ? 'bg-red-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{getProgressPercentage()}% 完成</span>
            {progress.estimatedTimeRemaining && (
              <span>預估剩餘時間: {progress.estimatedTimeRemaining}秒</span>
            )}
          </div>
        </div>
      )}

      {/* Error Details */}
      {progress.status === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            下載失敗，請檢查網路連線或 Canva 連結是否有效，然後重試。
          </div>
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'complete' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            下載完成！檔案已儲存到您的下載資料夾。
          </div>
        </div>
      )}
    </div>
  )
}