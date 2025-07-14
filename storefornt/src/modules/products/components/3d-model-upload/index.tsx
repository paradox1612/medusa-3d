"use client"

import { Button } from "@medusajs/ui"
import React, { useState, useRef, useActionState, useCallback, useTransition } from "react"
import { Upload, X, FileImage, Loader2, Box, Send, Eye, Download, RotateCcw } from "lucide-react"
import { validateImages, submitModelGeneration } from "@lib/data/3d-model"

interface Image3DUploadProps {
  onModelGenerated: (modelData: any) => void // Accept complete API response
  onProcessingStarted?: () => void
  onError?: (errorMessage: string) => void
}

// 3D Model Preview Component
const ModelPreview = ({ modelUrl, onClose }: { modelUrl: string; onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = modelUrl
    link.download = `3d-model-${Date.now()}.glb`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

      {/* 3D Model Viewer */}
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

        {/* Model Viewer using model-viewer web component */}
        <div 
          className="w-full h-full"
          ref={(el) => {
            if (el && modelUrl) {
              // Create model-viewer element
              el.innerHTML = `<model-viewer 
                src="${modelUrl}" 
                alt="Generated 3D model" 
                auto-rotate 
                camera-controls 
                style="width: 100%; height: 100%; border-radius: 8px;"
                loading="eager"
                reveal="auto">
              </model-viewer>`
              
              // Add event listeners
              const modelViewer = el.querySelector('model-viewer')
              if (modelViewer) {
                modelViewer.addEventListener('load', () => {
                  console.log("✅ Model-viewer loaded successfully")
                  setIsLoading(false)
                  setError("")
                })
                
                modelViewer.addEventListener('error', () => {
                  console.error("❌ Model-viewer failed to load")
                  setIsLoading(false)
                  setError("Failed to load 3D model")
                })
              }
            }
          }}
        />
      </div>

      {/* Model Controls */}
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

const Image3DUpload = ({ onModelGenerated, onProcessingStarted, onError }: Image3DUploadProps) => {
  const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null, null])
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null, null, null])
  const [error, setError] = useState("")
  const [currentSlot, setCurrentSlot] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedModel, setGeneratedModel] = useState<any | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
  const formRef = useRef<HTMLFormElement>(null)
  
  const [state, formAction] = useActionState(submitModelGeneration, null)
  const [isPending, startTransition] = useTransition()

  // Memoize values to prevent unnecessary re-renders
  const filledCount = React.useMemo(() => 
    selectedImages.filter(img => img !== null).length, 
    [selectedImages]
  )
  
  // Better isGenerating logic that handles all states including transition
  const isGenerating = React.useMemo(() => {
    if (isPending) return true // React transition is pending
    if (isProcessing) return true // Manual processing state
    if (state === null) return false // No submission yet
    if (state?.success === false && state?.error) return false // Error state
    if (state?.success === true) return false // Success state
    return true // Processing state (when state exists but no success/error yet)
  }, [state, isProcessing, isPending])

  // Debug logging with stable dependencies
  React.useEffect(() => {
    console.log("🎭 3D Upload Component State:", {
      selectedImages: selectedImages.map((img, i) => img ? `Slot ${i}: ${img.name} (${img.size} bytes)` : `Slot ${i}: empty`),
      imageUrls: imageUrls.map((url, i) => url ? `Slot ${i}: ${url.slice(0, 30)}...` : `Slot ${i}: no URL`),
      selectedImagesLength: selectedImages.length,
      error,
      currentSlot,
      filledCount,
      isGenerating,
      isPending,
      isProcessing,
      generatedModel: generatedModel ? 'Model available' : 'No model',
      showPreview
    })
  }, [selectedImages, imageUrls, error, currentSlot, filledCount, isGenerating, isPending, isProcessing, generatedModel, showPreview])

  // Handle form submission result
  React.useEffect(() => {
    console.log("🔄 Form submission result:", state)
    
    if (state?.success && 'data' in state) {
      console.log("✅ 3D Model generated successfully:", state.data)
      setIsProcessing(false)
      setGeneratedModel(state.data!)
      setShowPreview(true) // Automatically show preview when model is ready
      
      // Notify parent component IMMEDIATELY
      console.log("📦 Passing generated model data to parent component to be added to cart metadata:", state.data)
      onModelGenerated(state.data!)
      
      // Reset form and clean up URLs
      imageUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
      
      setSelectedImages([null, null, null, null])
      setImageUrls([null, null, null, null])
      fileInputRefs.current.forEach(ref => {
        if (ref) ref.value = ""
      })
      setCurrentSlot(0)
      setError("")
    } else if (state?.error) {
      console.error("❌ 3D Model generation failed:", state.error)
      setIsProcessing(false)
      setError(state.error)
      onError?.(state.error) // Notify parent component of error
    } else if (state && !state.hasOwnProperty('success') && !state.hasOwnProperty('error')) {
      // This means we're in processing state
      console.log("⏳ 3D Model generation in progress...")
      setIsProcessing(true)
      setError("")
    }
  }, [state, onModelGenerated, imageUrls])

  // Cleanup blob URLs on component unmount
  React.useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, []) // Empty dependency array - only run on unmount

  // Memoized image select handler to prevent recreation on every render
  const handleImageSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      console.log(`❌ No files selected for slot ${slotIndex}`)
      return
    }

    const file = files[0]
    console.log(`📸 Image selected for slot ${slotIndex}:`, {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      lastModified: file.lastModified
    })

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      console.error(`❌ File is not an image: ${file.type}`)
      setError("Please select an image file")
      return
    }

    // Validate individual file (basic checks only)
    try {
      // Basic file validation without the 4-image requirement
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

      if (file.size > maxSize) {
        console.error(`❌ File too large for slot ${slotIndex}:`, file.size)
        setError(`File too large. Maximum size is 10MB.`)
        return
      }

      if (!allowedTypes.includes(file.type)) {
        console.error(`❌ Invalid file type for slot ${slotIndex}:`, file.type)
        setError(`Invalid file type. Please use JPEG, PNG, or WebP.`)
        return
      }

      console.log(`✅ Individual file validation passed for slot ${slotIndex}`)
    } catch (error) {
      console.error(`❌ Validation error for slot ${slotIndex}:`, error)
      setError("File validation failed")
      return
    }

    // Update state using functional updates to avoid stale closures
    setSelectedImages(prevImages => {
      const newImages = [...prevImages]
      // Clean up old blob URL if exists
      if (imageUrls[slotIndex]) {
        URL.revokeObjectURL(imageUrls[slotIndex]!)
        console.log(`🧹 Cleaned up old blob URL for slot ${slotIndex}`)
      }
      newImages[slotIndex] = file
      return newImages
    })

    setImageUrls(prevUrls => {
      const newUrls = [...prevUrls]
      // Create blob URL for preview
      const blobUrl = URL.createObjectURL(file)
      console.log(`🖼️ Created blob URL for slot ${slotIndex}:`, blobUrl)
      newUrls[slotIndex] = blobUrl
      return newUrls
    })

    console.log(`✅ Image added to slot ${slotIndex}`, {
      slot: slotIndex,
      fileName: file.name
    })

    // Move to next empty slot
    setSelectedImages(currentImages => {
      const newImages = [...currentImages]
      newImages[slotIndex] = file
      const nextEmptySlot = newImages.findIndex((img, index) => img === null && index > slotIndex)
      if (nextEmptySlot !== -1) {
        setCurrentSlot(nextEmptySlot)
        console.log(`➡️ Moving to next empty slot: ${nextEmptySlot}`)
      } else {
        console.log(`✅ All slots filled!`)
      }
      return newImages
    })

    setError("")
  }, [imageUrls]) // Only depend on imageUrls for cleanup

  const removeImage = useCallback((index: number) => {
    console.log(`🗑️ Removing image from slot ${index}`)

    // Clean up blob URL to prevent memory leaks
    setImageUrls(prevUrls => {
      if (prevUrls[index]) {
        URL.revokeObjectURL(prevUrls[index]!)
        console.log(`🧹 Cleaned up blob URL for slot ${index}`)
      }
      const newUrls = [...prevUrls]
      newUrls[index] = null
      return newUrls
    })

    setSelectedImages(prevImages => {
      const newImages = [...prevImages]
      newImages[index] = null
      return newImages
    })

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = ""
    }

    // Set current slot to the removed one for easy re-upload
    setCurrentSlot(index)
    console.log(`📍 Set current slot to ${index} for re-upload`)
  }, [])

  const handleSendAll = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const filledImages = selectedImages.filter(img => img !== null) as File[]

    console.log("🚀 Attempting to send all images:", {
      totalSelected: filledImages.length,
      images: filledImages.map(img => ({ name: img.name, size: img.size }))
    })

    if (filledImages.length !== 4) {
      const errorMsg = `Please select exactly 4 images. Currently have ${filledImages.length}`
      console.error("❌ Send validation failed:", errorMsg)
      setError(errorMsg)
      return
    }

    // Validate all 4 images (client-side validation)
    console.log("🔍 Validating all 4 images together...")

    // Client-side validation only
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of filledImages) {
      if (!validTypes.includes(file.type)) {
        console.error("❌ Invalid file type:", file.type)
        setError(`Invalid file type: ${file.type}. Please use JPEG, PNG, or WebP.`)
        return
      }

      if (file.size > maxSize) {
        console.error("❌ File too large:", file.size)
        setError(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`)
        return
      }
    }

    console.log("✅ All 4 images validation passed")

    // Create fresh FormData for submission
    const formData = new FormData()

    filledImages.forEach((file, index) => {
      console.log(`📎 Adding file ${index + 1} to form:`, file.name, file.size, file.type)
      formData.append('files', file)
    })

    // Add optional parameters
    formData.append('caption', '')
    formData.append('steps', '20')
    formData.append('guidance_scale', '7.5')
    formData.append('octree_resolution', '256')

    console.log("📤 About to submit form with data:", {
      files: filledImages.length,
      totalFormDataKeys: Array.from(formData.keys()),
      caption: '',
      steps: '20',
      guidance_scale: '7.5',
      octree_resolution: '256'
    })

    setError("")
    setIsProcessing(true) // Set processing state immediately when form is submitted
    onProcessingStarted?.() // Notify parent component
    
    // Use startTransition to properly handle the async action
    startTransition(() => {
      formAction(formData)
    })
  }, [selectedImages, formAction, onProcessingStarted])

  // Memoized slot rendering to prevent unnecessary re-renders
  const renderSlot = useCallback((image: File | null, index: number) => {
    console.log(`🔍 Rendering slot ${index}:`, {
      hasImage: !!image,
      imageName: image?.name || 'null',
      imageSize: image?.size || 'null',
      imageType: image?.type || 'null'
    })

    return (
      <div key={index} className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          {index === 0 ? 'Main View' : `View ${index + 1}`}
          <span className="ml-2 text-xs text-gray-500">
            {image ? `✅ ${image.name.slice(0, 15)}...` : '❌ Empty'}
          </span>
        </div>

        {/* File Input for each slot */}
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
                onLoad={() => console.log(`🖼️ Image loaded successfully for slot ${index}:`, image.name)}
                onError={(e) => {
                  console.error(`❌ Image failed to load for slot ${index}:`, image.name, e)
                  setError(`Failed to load image: ${image.name}`)
                }}
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
            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors ${currentSlot === index
                ? 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => {
              console.log(`🖱️ Clicked on slot ${index} label`)
              console.log(`📁 File input element:`, fileInputRefs.current[index])
            }}
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

  console.log("🔢 Current counts:", { filledCount, isGenerating })

  return (
    <div className="space-y-6">
      {/* Model Preview Section */}
      {generatedModel && showPreview && (
        <ModelPreview 
          modelUrl={generatedModel.model_url} 
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
                  const link = document.createElement('a')
                  link.href = generatedModel.model_url
                  link.download = `3d-model-${generatedModel.prediction_id}.glb`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
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

      {/* Upload Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Box className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Generate 3D Model</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Upload 4 images from different angles to generate an interactive 3D model. For best results, capture front, back, left, and right views.
        </p>

        <form ref={formRef} onSubmit={handleSendAll} className="space-y-4">
          {/* Individual Image Slots */}
          <div className="grid grid-cols-2 gap-4">
            {selectedImages.map((image, index) => renderSlot(image, index))}
          </div>

          {/* Progress Counter */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
              <FileImage className="w-4 h-4" />
              <span>{filledCount}/4 images selected</span>
            </div>
          </div>

          {/* Progress/Error Messages */}
          {isGenerating && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-700">Generating 3D model...</span>
                <p className="text-xs text-blue-600 mt-1">
                  This process can take 2-5 minutes. Your model will appear automatically when ready.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Send All Button */}
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

          <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
            <p><strong>Tips for best results:</strong></p>
            <p>• Use good lighting and clear focus</p>
            <p>• Take photos from 4 distinct angles (front, back, left, right)</p>
            <p>• Keep the background simple and uncluttered</p>
            <p>• Current progress: {filledCount}/4 images • Status: {isGenerating ? 'Generating...' : 'Ready'}</p>
          </div>
        </form>
      </div>

      {/* Add model-viewer script */}
      <script 
        type="module" 
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />
    </div>
  )
}

export default Image3DUpload