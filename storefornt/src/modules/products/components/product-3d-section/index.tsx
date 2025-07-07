"use client"

import React, { useState, useCallback } from "react"
import { Box, RotateCcw, Upload, AlertCircle } from "lucide-react"
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
    console.log("🔄 Product3DSection: Updating state after model generation")
    
    // Update all states immediately
    setCurrentModel(modelData)
    setIsGenerating(false) // Stop loading state
    setShowUpload(false)   // Hide upload interface
    setError(null)         // Clear any errors
    
    console.log("✅ Product3DSection: State updated - should show 3D viewer now")
    
    // Force a re-render to ensure state changes are reflected
    setTimeout(() => {
                     console.log("🔍 Final state check:", {
                 hasModel: !!modelData,
                 modelUrl: modelData?.model_url || 'no url',
                 showUpload: false,
                 isGenerating: false
               })
    }, 50)
  }, [])

  const handleUploadStarted = useCallback(() => {
    console.log("🚀 3D Model generation started...")
    setIsGenerating(true)
    setError(null)
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    console.error("❌ 3D Model generation failed:", errorMessage)
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

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 Product3DSection State:", {
      currentModel: currentModel ? `Model available: ${currentModel.model_url?.slice(0, 50) || 'unknown URL'}...` : 'No model',
      isGenerating,
      error,
      showUpload,
      hasExistingModel
    })
  }, [currentModel, isGenerating, error, showUpload, hasExistingModel])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Info (remove in production) */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm space-y-2">
        <div>
          <strong>🔍 Debug State:</strong><br/>
          • isGenerating: <span className="font-mono">{isGenerating.toString()}</span><br/>
          • showUpload: <span className="font-mono">{showUpload.toString()}</span><br/>
          • hasModel: <span className="font-mono">{(!!currentModel).toString()}</span><br/>
          • error: <span className="font-mono">{error || 'none'}</span><br/>
          • modelUrl: <span className="font-mono text-xs">{currentModel?.model_url ? currentModel.model_url.slice(0, 40) + '...' : 'none'}</span>
        </div>
        
        {/* Debug Controls */}
        <div className="flex gap-2 text-xs">
          <button 
            onClick={() => {
              // Simulate successful model generation for testing
              const testModel = {
                model_url: "https://minio.mersate.com/mersate/3d_model_b87ef301-c482-435d-b8cb-55a1089670ad-01JZJAD0WEXF85KZT8N2FFPJD0.glb",
                prediction_id: "test-prediction-id",
                uploaded_images: ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"],
                compression_stats: []
              }
              handleModelGenerated(testModel)
            }}
            className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded"
          >
            🧪 Test Model Ready
          </button>
          
          <button 
            onClick={() => {
              setCurrentModel(null)
              setShowUpload(true)
              setIsGenerating(false)
              setError(null)
            }}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            🔄 Reset State
          </button>
          
          <button 
            onClick={() => {
              setShowUpload(!showUpload)
            }}
            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
          >
            🔀 Toggle Upload
          </button>
        </div>
      </div>
      
      {/* Header with product info */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <Box className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              3D Product Experience
            </h2>
            <p className="text-sm text-gray-600">
              {hasExistingModel 
                ? "View this product in 3D or generate a new model"
                : "Generate a 3D model from product images"
              }
            </p>
          </div>
        </div>
        
        {currentModel && !showUpload && (
          <Button
            onClick={handleStartNewGeneration}
            variant="secondary"
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Generate New
          </Button>
        )}
      </div>

            {/* Main Content Area */}
      {currentModel && !showUpload ? (
        // CASE 1: Model is ready - show 3D viewer
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Box className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-medium text-green-700">✅ 3D Model Ready!</h4>
                <p className="text-sm text-green-600">Your interactive 3D model has been generated successfully.</p>
              </div>
            </div>
          </div>

          {/* Model Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Model Status</p>
              <p className="text-lg font-semibold text-green-600">✅ Ready</p>
            </div>
            {currentModel && currentModel.prediction_id && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Prediction ID</p>
                <p className="text-xs text-gray-500 font-mono">
                  {currentModel.prediction_id.slice(0, 8)}...
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Source Images</p>
              <p className="text-lg font-semibold text-blue-600">
                {currentModel?.uploaded_images?.length || 4} images
              </p>
            </div>
          </div>

          {/* 3D Viewer */}
          <Model3DViewer
            modelUrl={currentModel?.model_url || ''}
            isLoading={false}
            error={error || undefined}
            onRetry={handleRetry}
            className="min-h-[500px]"
          />

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleStartNewGeneration}
              variant="secondary"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Generate New Model
            </Button>
            
            <Button
              onClick={handleRetry}
              variant="secondary"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Viewer
            </Button>
          </div>
        </div>
      ) : (
        // CASE 2: No model yet - show upload interface
        <div className="space-y-4">
          {hasExistingModel && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> This product already has a 3D model. 
                Generating a new one will replace the existing model.
              </p>
            </div>
          )}
          
          {isGenerating && !error && !currentModel && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Box className="w-8 h-8 text-blue-400" />
                  <div className="absolute inset-0 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700">3D Model Generation in Progress</h4>
                  <p className="text-sm text-blue-600">Please wait while we process your images...</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-700">3D Model Generation Failed</h4>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
                <Button
                  onClick={handleRetry}
                  variant="secondary"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          <Image3DUpload
            onModelGenerated={handleModelGenerated}
            onProcessingStarted={handleUploadStarted}
            onError={handleError}
          />
        </div>
      )}
    </div>
  )
}

export default Product3DSection 