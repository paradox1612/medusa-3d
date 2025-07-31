import { ThreeDJob, PersistedJobData } from './types'

const STORAGE_KEYS = {
  CURRENT_JOB: 'threed_current_job',
  JOB_HISTORY: 'threed_job_history',
  TEMP_IMAGES: 'threed_temp_images'
} as const

export const StorageUtils = {
  saveCurrentJob: (data: PersistedJobData): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_JOB, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save job to localStorage:', error)
    }
  },

  getCurrentJob: (): PersistedJobData | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_JOB)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to load job from localStorage:', error)
      return null
    }
  },

  clearCurrentJob: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_JOB)
    } catch (error) {
      console.warn('Failed to clear job from localStorage:', error)
    }
  },

  saveJobHistory: (job: ThreeDJob): void => {
    if (typeof window === 'undefined') return
    try {
      const history = StorageUtils.getJobHistory()
      const updatedHistory = [job, ...history.filter(j => j.id !== job.id)].slice(0, 10)
      localStorage.setItem(STORAGE_KEYS.JOB_HISTORY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.warn('Failed to save job history:', error)
    }
  },

  getJobHistory: (): ThreeDJob[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOB_HISTORY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to load job history:', error)
      return []
    }
  }
}