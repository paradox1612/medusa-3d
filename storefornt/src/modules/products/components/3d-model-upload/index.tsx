// /modules/products/components/3d-model-upload/index.tsx
"use client"

import { Button } from "@medusajs/ui"
import React, { useState, useRef, useActionState, useCallback, useTransition, useEffect } from "react"
import { Upload, X, FileImage, Loader2, Box, Send, Eye, Download, RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react"
// Updated imports - remove polling from server actions
import { 
  validateThreeDImages, 
  submitThreeDModelGeneration
} from "@lib/data/3d-poll-model"

// Add client-side polling function
import { clientPollThreeDJob } from "@lib/data/3d-client-polling"

// Type definitions
interface ThreeDJob {
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

interface UploadedImage {
  url: string
  filename: string
  base64?: string
  size_mb: string
}

interface CompressionStat {
  filename: string
  original_size_mb: string
  compressed_size_mb: string
  compression_ratio: string
}

interface ModelGenerationResponse {
  success: boolean
  job_id?: string
  message?: string
  status?: string
  estimated_completion_time?: string
  error?: string
}

interface JobStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  message?: string
  jobId?: string
  startTime?: number
  estimatedCompletion?: string
}

interface PersistedJobData {
  jobId: string
  status: JobStatus
  selectedImages: string[]
  startTime: number
  lastChecked: number
}

interface Image3DUploadProps {
  onModelGenerated: (modelData: ThreeDJob) => void
  onProcessingStarted?: () => void
  onError?: (errorMessage: string) => void
}

// Storage keys
const STORAGE_KEYS = {
  CURRENT_JOB: 'threed_current_job',
  JOB_HISTORY: 'threed_job_history',
  TEMP_IMAGES: 'threed_temp_images'
} as const

// Utility functions for persistence
// Update your StorageUtils object
const StorageUtils = {
  saveCurrentJob: (data: PersistedJobData): void => {
    if (typeof window === 'undefined') return; // ✅ Add this check
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_JOB, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save job to localStorage:', error)
    }
  },

  getCurrentJob: (): PersistedJobData | null => {
    if (typeof window === 'undefined') return null; // ✅ Add this check
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_JOB)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to load job from localStorage:', error)
      return null
    }
  },

  clearCurrentJob: (): void => {
    if (typeof window === 'undefined') return; // ✅ Add this check
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_JOB)
    } catch (error) {
      console.warn('Failed to clear job from localStorage:', error)
    }
  },

  saveJobHistory: (job: ThreeDJob): void => {
    if (typeof window === 'undefined') return; // ✅ Add this check
    try {
      const history = StorageUtils.getJobHistory()
      const updatedHistory = [job, ...history.filter(j => j.id !== job.id)].slice(0, 10)
      localStorage.setItem(STORAGE_KEYS.JOB_HISTORY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.warn('Failed to save job history:', error)
    }
  },

  getJobHistory: (): ThreeDJob[] => {
    if (typeof window === 'undefined') return []; // ✅ Add this check
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOB_HISTORY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to load job history:', error)
      return []
    }
  }
}
// 3D Model Preview Component
const ModelPreview: React.FC<{ modelUrl: string; onClose: () => void }> = ({ modelUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  
  const handleDownload = useCallback((): void => {
    const link = document.createElement('a')
    link.href = modelUrl
    link.download = `3d-model-${Date.now()}.glb`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [modelUrl])

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          <h4 className="text-lg font-semibold">3D Model Preview</h4>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm px-3 py-1 h-auto"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex items-center gap-2 text-sm px-3 py-1 h-auto"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="relative bg-white rounded-lg border" style={{ height: '400px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading 3D model...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
            <div className="text-center">
              <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">{error}</p>
              <Button
                variant="secondary"
                onClick={handleDownload}
                className="mt-2 text-sm px-3 py-1 h-auto"
              >
                Download Instead
              </Button>
            </div>
          </div>
        )}

        <div 
          className="w-full h-full"
          ref={(el) => {
            if (el && modelUrl) {
              el.innerHTML = `<model-viewer 
                src="${modelUrl}" 
                alt="Generated 3D model" 
                auto-rotate 
                camera-controls 
                style="width: 100%; height: 100%; border-radius: 8px;"
                loading="eager"
                reveal="auto">
              </model-viewer>`
              
              const modelViewer = el.querySelector('model-viewer')
              if (modelViewer) {
                modelViewer.addEventListener('load', () => {
                  setIsLoading(false)
                  setError("")
                })
                
                modelViewer.addEventListener('error', () => {
                  setIsLoading(false)
                  setError("Failed to load 3D model")
                })
              }
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-3 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <RotateCcw className="w-4 h-4" />
            <span>Drag to rotate</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📏</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Model ID: {modelUrl.split('/').pop()?.slice(0, 8)}...
        </div>
      </div>
    </div>
  )
}

// Job Status Display Component
const JobStatusDisplay: React.FC<{ jobStatus: JobStatus }> = ({ jobStatus }) => {
  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (jobStatus.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  if (jobStatus.status === 'idle') return null

  return (
    <div className={`flex items-center gap-2 p-4 border rounded ${getStatusColor()}`}>
      {getStatusIcon()}
      <div className="flex-1">
        <span className="text-sm font-medium">
          {jobStatus.message || `Status: ${jobStatus.status}`}
        </span>
        {jobStatus.progress !== undefined && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${jobStatus.progress}%` }}
              />
            </div>
            <p className="text-xs mt-1">{jobStatus.progress}% complete</p>
          </div>
        )}
        {jobStatus.jobId && (
          <p className="text-xs mt-1 opacity-75">Job ID: {jobStatus.jobId}</p>
        )}
      </div>
    </div>
  )
}

const Image3DUpload: React.FC<Image3DUploadProps> = ({ onModelGenerated, onProcessingStarted, onError }) => {
  // State with proper typing
  const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null, null])
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null, null, null])
  const [error, setError] = useState<string>("")
  const [currentSlot, setCurrentSlot] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [generatedModel, setGeneratedModel] = useState<ThreeDJob | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus>({ status: 'idle' })
  const [showPreview, setShowPreview] = useState<boolean>(false)
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
  const formRef = useRef<HTMLFormElement>(null)
  const pollingRef = useRef<AbortController | null>(null)
  
  // Server action for job creation only
  const [state, formAction] = useActionState(submitThreeDModelGeneration, null)
  const [isPending, startTransition] = useTransition()

  const filledCount = React.useMemo((): number => 
    selectedImages.filter(img => img !== null).length, 
    [selectedImages]
  )
  
  const isGenerating = React.useMemo((): boolean => {
    return (
      isPending || 
      isProcessing || 
      jobStatus.status === 'pending' || 
      jobStatus.status === 'processing'
    )
  }, [isPending, isProcessing, jobStatus.status])

  // Client-side polling function
  const startClientPolling = useCallback(async (jobId: string): Promise<void> => {
    if (pollingRef.current) {
      pollingRef.current.abort()
    }
    
    pollingRef.current = new AbortController()
    
    try {
      setIsProcessing(true)
      
      const result = await clientPollThreeDJob(jobId, {
        onProgress: (progress, status, job) => {
          setJobStatus(prev => ({
            ...prev,
            progress,
            message: `${status}: ${progress}% complete`,
            jobId,
            status: status as JobStatus['status']
          }))
        },
        signal: pollingRef.current.signal
      })
      
      console.log("✅ Client polling completed successfully:", result)
      
      setJobStatus({
        status: 'completed',
        progress: 100,
        message: '3D model generation complete!',
        jobId
      })
      
      setGeneratedModel(result)
      setShowPreview(true)
      StorageUtils.saveJobHistory(result)
      StorageUtils.clearCurrentJob()
      
      if (onModelGenerated) {
        onModelGenerated(result)
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Polling was cancelled")
        return
      }
      
      console.error("❌ Client polling failed:", error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during model generation'
      
      setJobStatus({
        status: 'failed',
        message: errorMessage,
        jobId
      })
      
      setError(errorMessage)
      StorageUtils.clearCurrentJob()
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsProcessing(false)
      pollingRef.current = null
    }
  }, [onModelGenerated, onError])

  // Restore job state on component mount
  useEffect(() => {
    const restoreJobState = async (): Promise<void> => {
      const persistedJob = StorageUtils.getCurrentJob()
      
      if (persistedJob && persistedJob.jobId) {
        console.log('🔄 Restoring job state:', persistedJob)
        
        setJobStatus(persistedJob.status)
        
        // If job is still in progress, resume client-side polling
        if (persistedJob.status.status === 'pending' || persistedJob.status.status === 'processing') {
          await startClientPolling(persistedJob.jobId)
        }
        
        // If job is completed, try to fetch final result
        if (persistedJob.status.status === 'completed') {
          try {
            const response = await fetch(`/api/threed-jobs/${persistedJob.jobId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.job) {
                setGeneratedModel(data.job)
                StorageUtils.saveJobHistory(data.job)
                StorageUtils.clearCurrentJob()
              }
            }
          } catch (error) {
            console.warn('Failed to fetch completed job details:', error)
          }
        }
      }
    }

    restoreJobState()
  }, [startClientPolling])

  // Save job state whenever it changes
  useEffect(() => {
    if (jobStatus.status !== 'idle' && jobStatus.jobId) {
      const persistedData: PersistedJobData = {
        jobId: jobStatus.jobId,
        status: jobStatus,
        selectedImages: selectedImages.map(img => img?.name || ''),
        startTime: jobStatus.startTime || Date.now(),
        lastChecked: Date.now()
      }
      StorageUtils.saveCurrentJob(persistedData)
    }
  }, [jobStatus, selectedImages])

  // Handle server action result (job creation only)
  useEffect(() => {
    if (!state) return

    const handleSubmissionResult = async (): Promise<void> => {
      console.log('📨 Form submission state:', state)
      
      if (state.success && state.job_id) {
        const jobId = state.job_id
        console.log('🚀 ThreeD job created successfully:', jobId)
        
        setJobStatus({
          status: 'pending',
          message: state.message || 'Job created, starting 3D model generation...',
          progress: 5,
          jobId,
          startTime: Date.now(),
          estimatedCompletion: state.estimated_completion_time
        })
        
        // Start client-side polling
        await startClientPolling(jobId)
        
      } else if (state.error) {
        console.error("❌ ThreeD job creation failed:", state.error)
        setError(state.error)
        setIsProcessing(false)
        
        if (onError) {
          onError(state.error)
        }
      }
    }

    handleSubmissionResult()
  }, [state, startClientPolling, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup blob URLs
      imageUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
      
      // Abort any ongoing polling
      if (pollingRef.current) {
        pollingRef.current.abort()
      }
    }
  }, [imageUrls])

  // Image selection handler
  const handleImageSelect = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>, 
    slotIndex: number
  ): Promise<void> => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    if (!file.type.startsWith('image/')) {
      setError("Please select an image file")
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is 10MB.`)
      return
    }

    if (imageUrls[slotIndex]) {
      URL.revokeObjectURL(imageUrls[slotIndex]!)
    }

    setSelectedImages(prev => {
      const newImages = [...prev]
      newImages[slotIndex] = file
      return newImages
    })

    const blobUrl = URL.createObjectURL(file)
    setImageUrls(prev => {
      const newUrls = [...prev]
      newUrls[slotIndex] = blobUrl
      return newUrls
    })

    const nextEmptySlot = selectedImages.findIndex((img, index) => img === null && index > slotIndex)
    if (nextEmptySlot !== -1) {
      setCurrentSlot(nextEmptySlot)
    }

    setError("")
  }, [imageUrls, selectedImages])

  // Remove image handler
  const removeImage = useCallback((index: number): void => {
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]!)
    }

    setImageUrls(prev => {
      const newUrls = [...prev]
      newUrls[index] = null
      return newUrls
    })

    setSelectedImages(prev => {
      const newImages = [...prev]
      newImages[index] = null
      return newImages
    })

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = ""
    }

    setCurrentSlot(index)
  }, [imageUrls])

  // Form submission handler (only creates job, doesn't poll)
  const handleSendAll = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const filledImages = selectedImages.filter((img): img is File => img !== null)

    const validation = await validateThreeDImages(filledImages)
    if (!validation.valid) {
      setError(validation.error || "Validation failed")
      return
    }

    const formData = new FormData()
    filledImages.forEach((file) => {
      formData.append('files', file)
    })

    formData.append('caption', '')
    formData.append('steps', '20')
    formData.append('guidance_scale', '7.5')
    formData.append('octree_resolution', '256')
    formData.append('user_id', 'user_' + Date.now())
    formData.append('session_id', 'session_' + Date.now())

    setError("")
    onProcessingStarted?.()
    
    startTransition(() => {
      formAction(formData)
    })
  }, [selectedImages, formAction, onProcessingStarted])

  // Slot rendering
  const renderSlot = useCallback((image: File | null, index: number): React.ReactElement => {
    const slotLabels = ['Main View', 'View 2', 'View 3', 'View 4']

    return (
      <div key={index} className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          {slotLabels[index]}
          <span className="ml-2 text-xs text-gray-500">
            {image ? `✅ ${image.name.slice(0, 15)}...` : '❌ Empty'}
          </span>
        </div>

        <input
          ref={el => { fileInputRefs.current[index] = el }}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleImageSelect(e, index)}
          className="hidden"
          id={`image-upload-${index}`}
          disabled={isGenerating}
        />

        {image && imageUrls[index] ? (
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
              <img
                src={imageUrls[index]!}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => setError(`Failed to load image: ${image.name}`)}
              />
            </div>
            {!isGenerating && (
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="absolute bottom-1 left-1 bg-green-600 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              ✓ {image.name.slice(0, 10)}...
            </div>
          </div>
        ) : (
          <label
            htmlFor={`image-upload-${index}`}
            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              currentSlot === index
                ? 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex flex-col items-center justify-center p-4">
              <Upload className={`w-6 h-6 mb-2 ${currentSlot === index ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-xs text-center">
                {currentSlot === index ? (
                  <span className="font-semibold text-blue-600">Click to upload</span>
                ) : (
                  <span className="text-gray-500">Upload image</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Slot {index + 1}</p>
            </div>
          </label>
        )}
      </div>
    )
  }, [imageUrls, currentSlot, isGenerating, handleImageSelect, removeImage])

  return (
    <div className="space-y-6">
      {/* Model Preview Section */}
      {generatedModel && showPreview && (
        <ModelPreview 
          modelUrl={generatedModel.model_url!} 
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Generated Model Actions */}
      {generatedModel && !showPreview && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-700">3D Model Ready!</h4>
                <p className="text-sm text-green-600">Your 3D model has been generated successfully.</p>
                <p className="text-xs text-green-500 mt-1">Job ID: {generatedModel.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 text-sm px-3 py-1 h-auto"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (generatedModel.model_url) {
                    const link = document.createElement('a')
                    link.href = generatedModel.model_url
                    link.download = `3d-model-${generatedModel.id}.glb`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
                className="flex items-center gap-2 text-sm px-3 py-1 h-auto"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Job Status Display */}
      <JobStatusDisplay jobStatus={jobStatus} />

      {/* Upload Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Box className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Generate 3D Model</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Upload 4 images from different angles to generate an interactive 3D model. 
          Your progress will be saved automatically and restored if you refresh the page.
        </p>

        <form ref={formRef} onSubmit={handleSendAll} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {selectedImages.map((image, index) => renderSlot(image, index))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
              <FileImage className="w-4 h-4" />
              <span>{filledCount}/4 images selected</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={filledCount !== 4 || isGenerating}
            className="w-full"
            variant={filledCount === 4 ? "primary" : "secondary"}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send All Images & Generate 3D Model ({filledCount}/4)
              </>
            )}
          </Button>

          {/* Tips and Status */}
          <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
            <p><strong>Tips for best results:</strong></p>
            <p>• Use good lighting and clear focus</p>
            <p>• Take photos from 4 distinct angles (front, back, left, right)</p>
            <p>• Keep the background simple and uncluttered</p>
            <p>• Your progress is automatically saved and restored on page refresh</p>
            <p>• Now using client-side polling with improved reliability</p>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
              <span>Progress: {filledCount}/4 images</span>
              <span>Status: {isGenerating ? 'Generating...' : jobStatus.status === 'idle' ? 'Ready' : jobStatus.status}</span>
              {jobStatus.jobId && (
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  Job: {jobStatus.jobId.slice(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Job History Section */}
      {StorageUtils.getJobHistory().length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="text-md font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Jobs
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {StorageUtils.getJobHistory().slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  {job.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : job.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="font-mono text-xs">{job.id.slice(0, 12)}...</span>
                  <span className="text-gray-600">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' :
                    job.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {job.status}
                  </span>
                  {job.status === 'completed' && job.model_url && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setGeneratedModel(job)
                        setShowPreview(true)
                      }}
                      className="text-xs px-2 py-1 h-auto"
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add model-viewer script */}
      <script 
        type="module" 
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />
    </div>
  )
}

export default Image3DUpload

/*
 * COMPLETE SOLUTION SUMMARY:
 * 
 * ✅ FIXED "Client Reference" ERROR:
 * - Removed all polling from server actions
 * - Server actions now only create jobs and return immediately
 * - Client-side polling handles long-running processes
 * - Proper separation of server/client concerns
 * 
 * ✅ PRESERVED ALL WORKING FEATURES:
 * - File picker works exactly as before (single click, immediate display)
 * - localStorage persistence and job restoration
 * - Progress tracking and error handling
 * - Model preview and download functionality
 * - Job history tracking
 * - All TypeScript types properly maintained
 * 
 * ✅ IMPROVED ARCHITECTURE:
 * - Server: Job creation only (submitThreeDModelGeneration)
 * - Client: Polling with startClientPolling()
 * - Real-time progress updates via callbacks
 * - Proper cancellation with AbortController
 * - Exponential backoff on errors
 * - Clean memory management
 * 
 * ✅ WORKFLOW:
 * 1. User selects 4 images → File picker works as before
 * 2. Form submits via useActionState → Server creates job only
 * 3. Server returns job_id immediately → No polling in server
 * 4. Client starts clientPollThreeDJob() → Pure client polling
 * 5. Progress updates via onProgress callback → Real-time UI
 * 6. Job completion handled on client → Results displayed
 * 7. No "Client Reference" errors → Follows Next.js patterns
 * 
 * REQUIRED FILES:
 * 1. This component (index.tsx) ✅
 * 2. Updated server actions (3d-poll-model.ts) ✅
 * 3. Client polling utility (3d-client-polling.ts) ✅
 * 4. Optional API route (api/threed-jobs/[jobId]/route.ts) ✅
 * 
 * The component is now complete and ready to use!
 */