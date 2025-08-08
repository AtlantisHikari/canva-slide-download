import type { DownloadProgress } from '@/types'

// Simple in-memory progress tracking
// In production, you might want to use Redis or a database
const progressMap = new Map<string, DownloadProgress>()

export function updateJobProgress(jobId: string, progress: DownloadProgress): void {
  progressMap.set(jobId, {
    ...progress,
    estimatedTimeRemaining: calculateEstimatedTime(progress)
  })
}

export async function getJobProgress(jobId: string): Promise<DownloadProgress | null> {
  return progressMap.get(jobId) || null
}

export function removeJobProgress(jobId: string): void {
  progressMap.delete(jobId)
}

export function getAllActiveJobs(): Map<string, DownloadProgress> {
  const activeJobs = new Map<string, DownloadProgress>()
  
  for (const [jobId, progress] of progressMap.entries()) {
    if (progress.status !== 'complete' && progress.status !== 'error') {
      activeJobs.set(jobId, progress)
    }
  }
  
  return activeJobs
}

function calculateEstimatedTime(progress: DownloadProgress): number | undefined {
  if (progress.percentage <= 0 || progress.status === 'idle') {
    return undefined
  }

  // Simple linear estimation based on current progress
  // This could be improved with historical data and more sophisticated algorithms
  const now = Date.now()
  const startTime = getJobStartTime(progress)
  
  if (!startTime) {
    return undefined
  }

  const elapsedTime = now - startTime
  const remainingPercentage = 100 - progress.percentage
  const timePerPercentage = elapsedTime / progress.percentage
  
  return Math.round(remainingPercentage * timePerPercentage)
}

// Track job start times for ETA calculation
const jobStartTimes = new Map<string, number>()

export function trackJobStart(jobId: string): void {
  jobStartTimes.set(jobId, Date.now())
}

export function getJobStartTime(progress: DownloadProgress): number | undefined {
  // Extract job ID from progress object if available
  // This is a simplified approach - in production you'd have better job tracking
  return Date.now() - 60000 // Fallback: assume job started 1 minute ago
}

export function cleanupJobTracking(jobId: string): void {
  progressMap.delete(jobId)
  jobStartTimes.delete(jobId)
}

// Progress event emitter for real-time updates
export class ProgressEmitter {
  private listeners = new Map<string, Set<(progress: DownloadProgress) => void>>()

  subscribe(jobId: string, callback: (progress: DownloadProgress) => void): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set())
    }
    
    this.listeners.get(jobId)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(jobId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(jobId)
        }
      }
    }
  }

  emit(jobId: string, progress: DownloadProgress): void {
    const callbacks = this.listeners.get(jobId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(progress)
        } catch (error) {
          console.error('Progress callback error:', error)
        }
      })
    }
  }

  cleanup(jobId: string): void {
    this.listeners.delete(jobId)
  }
}

// Global progress emitter instance
export const progressEmitter = new ProgressEmitter()

// Enhanced progress update function with event emission
export function emitJobProgress(jobId: string, progress: DownloadProgress): void {
  updateJobProgress(jobId, progress)
  progressEmitter.emit(jobId, progress)
}

// Progress monitoring utilities
export function createProgressMonitor(jobId: string) {
  return {
    update: (progress: Partial<DownloadProgress>) => {
      const currentProgress = getJobProgress(jobId)
      const updatedProgress: DownloadProgress = {
        status: 'idle',
        currentPage: 0,
        totalPages: 0,
        percentage: 0,
        message: '',
        ...currentProgress,
        ...progress
      }
      
      emitJobProgress(jobId, updatedProgress)
    },
    
    complete: (message: string = '完成') => {
      const currentProgress = getJobProgress(jobId)
      const completeProgress: DownloadProgress = {
        status: 'complete',
        currentPage: currentProgress?.totalPages || 0,
        totalPages: currentProgress?.totalPages || 0,
        percentage: 100,
        message,
        estimatedTimeRemaining: 0
      }
      
      emitJobProgress(jobId, completeProgress)
    },
    
    error: (message: string) => {
      const currentProgress = getJobProgress(jobId)
      const errorProgress: DownloadProgress = {
        status: 'error',
        currentPage: currentProgress?.currentPage || 0,
        totalPages: currentProgress?.totalPages || 0,
        percentage: currentProgress?.percentage || 0,
        message,
        estimatedTimeRemaining: undefined
      }
      
      emitJobProgress(jobId, errorProgress)
    },
    
    cleanup: () => {
      cleanupJobTracking(jobId)
      progressEmitter.cleanup(jobId)
    }
  }
}

// Batch progress tracking for multiple jobs
export class BatchProgressTracker {
  private jobs = new Map<string, DownloadProgress>()
  private onUpdate?: (overall: DownloadProgress) => void

  constructor(onUpdate?: (overall: DownloadProgress) => void) {
    this.onUpdate = onUpdate
  }

  addJob(jobId: string): void {
    this.jobs.set(jobId, {
      status: 'idle',
      currentPage: 0,
      totalPages: 0,
      percentage: 0,
      message: '等待開始...'
    })
    
    this.updateOverallProgress()
  }

  updateJob(jobId: string, progress: DownloadProgress): void {
    this.jobs.set(jobId, progress)
    this.updateOverallProgress()
  }

  removeJob(jobId: string): void {
    this.jobs.delete(jobId)
    this.updateOverallProgress()
  }

  private updateOverallProgress(): void {
    if (!this.onUpdate || this.jobs.size === 0) return

    const allJobs = Array.from(this.jobs.values())
    const completedJobs = allJobs.filter(job => job.status === 'complete').length
    const errorJobs = allJobs.filter(job => job.status === 'error').length
    const totalPercentage = allJobs.reduce((sum, job) => sum + job.percentage, 0)
    const averagePercentage = totalPercentage / allJobs.length

    let status: DownloadProgress['status'] = 'idle'
    let message = ''

    if (completedJobs === allJobs.length) {
      status = 'complete'
      message = `所有 ${allJobs.length} 個任務已完成`
    } else if (errorJobs > 0 && completedJobs + errorJobs === allJobs.length) {
      status = 'error'
      message = `${completedJobs} 個任務完成，${errorJobs} 個任務失敗`
    } else if (allJobs.some(job => job.status !== 'idle')) {
      status = 'capturing'
      message = `進行中：${completedJobs}/${allJobs.length} 個任務完成`
    }

    this.onUpdate({
      status,
      currentPage: completedJobs,
      totalPages: allJobs.length,
      percentage: averagePercentage,
      message
    })
  }
}

// Cleanup old progress data periodically
setInterval(() => {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour
  
  for (const [jobId, startTime] of jobStartTimes.entries()) {
    if (now - startTime > maxAge) {
      cleanupJobTracking(jobId)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes