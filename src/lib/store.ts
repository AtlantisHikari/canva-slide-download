import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  DownloadStore, 
  DownloadJob, 
  DownloadOptions, 
  DownloadProgress, 
  DownloadResult, 
  DownloadHistory, 
  UserPreferences
} from '@/types'
import { DEFAULT_USER_PREFERENCES } from '@/types'

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      jobs: new Map<string, DownloadJob>(),
      history: [],
      preferences: DEFAULT_USER_PREFERENCES,

      addJob: (url: string, options: DownloadOptions): string => {
        const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const job: DownloadJob = {
          id,
          url,
          options,
          progress: {
            status: 'idle',
            currentPage: 0,
            totalPages: 0,
            percentage: 0,
            message: '準備開始下載...'
          },
          createdAt: new Date()
        }

        set(state => ({
          jobs: new Map(state.jobs.set(id, job))
        }))

        return id
      },

      updateJobProgress: (id: string, progress: DownloadProgress) => {
        const jobs = get().jobs
        const job = jobs.get(id)
        
        if (job) {
          const updatedJob = {
            ...job,
            progress,
            startedAt: job.startedAt || new Date()
          }
          
          set(state => ({
            jobs: new Map(state.jobs.set(id, updatedJob))
          }))
        }
      },

      completeJob: (id: string, result: DownloadResult) => {
        const jobs = get().jobs
        const job = jobs.get(id)
        
        if (job) {
          const completedJob = {
            ...job,
            result,
            completedAt: new Date(),
            progress: {
              ...job.progress,
              status: result.success ? 'complete' as const : 'error' as const,
              percentage: 100,
              message: result.success ? '下載完成！' : result.error || '下載失敗'
            }
          }

          // Add to history if successful
          if (result.success && result.pageCount && result.fileSize) {
            const historyItem: DownloadHistory = {
              id: `history_${Date.now()}`,
              url: job.url,
              title: `Canva Slides ${new Date().toLocaleDateString()}`,
              pageCount: result.pageCount,
              fileSize: result.fileSize,
              downloadedAt: new Date(),
              options: job.options
            }

            set(state => ({
              jobs: new Map(state.jobs.set(id, completedJob)),
              history: [historyItem, ...state.history.slice(0, 49)] // Keep last 50 items
            }))
          } else {
            set(state => ({
              jobs: new Map(state.jobs.set(id, completedJob))
            }))
          }
        }
      },

      cancelJob: (id: string) => {
        const jobs = get().jobs
        const job = jobs.get(id)
        
        if (job) {
          const cancelledJob = {
            ...job,
            completedAt: new Date(),
            progress: {
              ...job.progress,
              status: 'error' as const,
              message: '下載已取消'
            }
          }
          
          set(state => ({
            jobs: new Map(state.jobs.set(id, cancelledJob))
          }))
        }
      },

      addToHistory: (item: DownloadHistory) => {
        set(state => ({
          history: [item, ...state.history.slice(0, 49)]
        }))
      },

      updatePreferences: (newPreferences: Partial<UserPreferences>) => {
        set(state => ({
          preferences: { ...state.preferences, ...newPreferences }
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      }
    }),
    {
      name: 'canva-downloader-store',
      partialize: (state) => ({
        history: state.history,
        preferences: state.preferences
        // Don't persist jobs as they are temporary
      }),
      version: 1
    }
  )
)

// Utility hooks for easier access to store data
export const useActiveJobs = () => {
  const jobs = useDownloadStore(state => state.jobs)
  return Array.from(jobs.values()).filter(job => 
    job.progress.status !== 'complete' && job.progress.status !== 'error'
  )
}

export const useRecentHistory = (limit: number = 10) => {
  return useDownloadStore(state => state.history.slice(0, limit))
}

export const useJobById = (id: string) => {
  return useDownloadStore(state => state.jobs.get(id))
}

// Progress tracking utility
export const getJobProgress = async (jobId: string): Promise<DownloadProgress | null> => {
  const store = useDownloadStore.getState()
  const job = store.jobs.get(jobId)
  return job?.progress || null
}