export interface ThreeDJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prediction_id?: string
  model_url?: string
  original_model_url?: string
  uploaded_images?: UploadedImage[]
  compression_stats?: CompressionStat[]
  processing_time?: number
  error_message?: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, any>
}

export interface UploadedImage {
  url: string
  filename: string
  base64?: string
  size_mb: string
}

export interface CompressionStat {
  filename: string
  original_size_mb: string
  compressed_size_mb: string
  compression_ratio: string
}

export interface ModelGenerationResponse {
  success: boolean
  job_id?: string
  message?: string
  status?: string
  estimated_completion_time?: string
  error?: string
}

export interface JobStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  message?: string
  jobId?: string
  startTime?: number
  estimatedCompletion?: string
}

export interface PersistedJobData {
  jobId: string
  status: JobStatus
  selectedImages: string[]
  startTime: number
  lastChecked: number
}

export interface Image3DUploadProps {
  onModelGenerated: (modelData: ThreeDJob) => void
  onProcessingStarted?: () => void
  onError?: (errorMessage: string) => void
}