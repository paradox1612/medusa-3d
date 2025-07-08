"use client"

import React, { useState, useCallback } from "react"
import { Box, RotateCcw, Upload, AlertCircle, Camera, Users, Sparkles } from "lucide-react"
import { Button } from "@medusajs/ui"
import Image3DUpload from "../3d-model-upload"
import Model3DViewer from "../3d-viewer"

interface Product3DSectionProps {
  product?: any // Product data from Medusa
  className?: string
}

interface ModelData {
  [key: string]: any // Accept any API response structure
}

const Product3DSection: React.FC<Product3DSectionProps> = ({
  product,
  className = ""
}) => {
  const [currentModel, setCurrentModel] = useState<ModelData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(true)

  // Check if product already has a 3D model in metadata
  const existingModelUrl = product?.metadata?.model_3d_url
  const hasExistingModel = !!existingModelUrl

  React.useEffect(() => {
    if (hasExistingModel) {
      setCurrentModel({
        model_url: existingModelUrl,
        prediction_id: product?.metadata?.prediction_id || '',
        uploaded_images: [],
        compression_stats: []
      })
      setShowUpload(false)
    }
  }, [hasExistingModel, existingModelUrl, product])

  const handleModelGenerated = useCallback((modelData: ModelData) => {
    console.log("🎯 3D Model generated successfully:", modelData)
    setCurrentModel(modelData)
    setIsGenerating(false)
    setShowUpload(false)
    setError(null)
  }, [])

  const handleUploadStarted = useCallback(() => {
    setIsGenerating(true)
    setError(null)
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    setIsGenerating(false)
    setError(errorMessage)
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setCurrentModel(null)
    setShowUpload(true)
    setIsGenerating(false)
  }, [])

  const handleStartNewGeneration = useCallback(() => {
    setShowUpload(true)
    setCurrentModel(null)
    setError(null)
  }, [])

  return (
    <div className="p-3 sm:p-6 m-2 sm:m-4">
      <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
            <Box className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              3D Product Experience
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Transform your product photos into an interactive 3D experience
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentModel && !showUpload ? (
        // Model Ready State
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Your 3D Model is Ready!</h3>
                <p className="text-green-700 text-sm">Your personalized 3D miniature has been generated successfully.</p>
              </div>
            </div>
          </div>

          {/* Model Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-green-600">Ready</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Images Used</p>
              <p className="font-semibold text-blue-600">
                {currentModel?.uploaded_images?.length || 4}
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Box className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Model Type</p>
              <p className="font-semibold text-purple-600">3D Miniature</p>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <Model3DViewer
              modelUrl={currentModel?.model_url || ''}
              isLoading={false}
              error={error || undefined}
              onRetry={handleRetry}
              className="min-h-[500px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={handleStartNewGeneration}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Photos
            </Button>
            
            <Button
              onClick={handleRetry}
              variant="secondary"
              className="px-6 py-2 rounded-lg font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload Viewer
            </Button>
          </div>
        </div>
      ) : (
        // Upload State
        <div className="space-y-4 sm:space-y-6">
          {/* How It Works */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">How it works:</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-xs sm:text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Upload your photos</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Add 1-4 high-quality photos from different angles</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-xs sm:text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Select size and brushes</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Choose your miniature size and paint brush options</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-xs sm:text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">We craft your 3D miniature</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Our AI processes your images into a 3D model</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-xs sm:text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Paint together at home</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Receive your personalized miniature kit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Model Notice */}
          {hasExistingModel && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Existing Model Found</h4>
                  <p className="text-amber-700 text-sm mt-1">
                    This product already has a 3D model. Uploading new photos will replace the current model.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Generation Progress */}
          {isGenerating && !error && !currentModel && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Creating Your 3D Miniature</h3>
                  <p className="text-blue-700">
                    Our AI is processing your photos to create your personalized 3D model...
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Generation Failed</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
                <Button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Upload Component */}
          <div className="upload-zones-container">
            <style jsx>{`
              .upload-zones-container :global(.upload-zone) {
                margin-right: 8px;
              }
              @media (min-width: 640px) {
                .upload-zones-container :global(.upload-zone) {
                  margin-right: 12px;
                }
              }
              .upload-zones-container :global(.upload-zone:last-child) {
                margin-right: 0;
              }
              .upload-zones-container :global(.upload-grid) {
                gap: 8px;
              }
              @media (min-width: 640px) {
                .upload-zones-container :global(.upload-grid) {
                  gap: 12px;
                }
              }
              /* Style the grid inside Image3DUpload */
              .upload-zones-container :global(.grid) {
                gap: 8px;
              }
              @media (min-width: 640px) {
                .upload-zones-container :global(.grid) {
                  gap: 12px;
                }
              }
              /* Remove redundant border since Image3DUpload has its own */
              .upload-zones-container :global(.border.rounded-lg) {
                border: none;
                padding: 0;
                background: transparent;
              }
            `}</style>
            <Image3DUpload
              onModelGenerated={handleModelGenerated}
              onProcessingStarted={handleUploadStarted}
              onError={handleError}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default Product3DSection