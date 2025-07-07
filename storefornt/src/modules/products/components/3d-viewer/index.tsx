"use client"

import React, { useState, useEffect } from "react"
import { Loader2, Box, Rotate3D, AlertCircle, Eye, Download, Maximize } from "lucide-react"
import { Button } from "@medusajs/ui"

interface Model3DViewerProps {
  modelUrl?: string
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  className?: string
}

const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelUrl,
  isLoading = false,
  error,
  onRetry,
  className = ""
}) => {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [modelSize, setModelSize] = useState<string>("")
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    if (modelUrl) {
      setModelLoaded(false)
      setModelError(null)
      setLoadingProgress(0)
      setDownloadProgress(0)
      
      // Get file size for better loading feedback
      fetch(modelUrl, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('content-length')
          if (size) {
            const sizeInMB = (parseInt(size) / 1024 / 1024).toFixed(1)
            setModelSize(`${sizeInMB} MB`)
            console.log(`📦 3D Model size: ${sizeInMB} MB`)
          }
        })
        .catch(err => console.warn('Could not get model size:', err))
    }
  }, [modelUrl])

  // Load model-viewer script if not already loaded
  useEffect(() => {
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
      document.head.appendChild(script)
    }
  }, [])

  // Progress simulation while loading
  useEffect(() => {
    if (!modelLoaded && modelUrl) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev // Cap at 90% until actually loaded
          return prev + Math.random() * 15 + 5 // Increase by 5-20%
        })
      }, 800)

      return () => clearInterval(interval)
    }
  }, [modelLoaded, modelUrl])

  const handleModelLoad = () => {
    console.log("✅ 3D Model loaded successfully")
    setModelLoaded(true)
    setModelError(null)
    setLoadingProgress(100)
  }

  const handleModelError = (err?: string) => {
    console.error("❌ 3D Model failed to load:", err)
    setModelError(err || "Failed to load 3D model")
    setModelLoaded(false)
    setLoadingProgress(0)
  }

  const handleDownload = () => {
    if (modelUrl) {
      const link = document.createElement('a')
      link.href = modelUrl
      link.download = 'model.glb'
      link.click()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (error || modelError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 border rounded-lg bg-red-50 border-red-200 ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">3D Model Error</h3>
        <p className="text-sm text-red-600 text-center mb-4">
          {error || modelError}
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="secondary"
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (isLoading || !modelUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 border rounded-lg bg-blue-50 border-blue-200 ${className}`}>
        <div className="relative mb-6">
          <Box className="w-16 h-16 text-blue-400" />
          <Loader2 className="absolute inset-0 w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          {isLoading ? "Generating 3D Model..." : "Waiting for 3D Model"}
        </h3>
        <p className="text-sm text-blue-600 text-center">
          {isLoading 
            ? "Please wait while we process your images and create the 3D model. This may take a few minutes."
            : "Upload 4 images from different angles to generate a 3D model of this product."
          }
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-blue-500">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
          <span>Processing...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`relative border rounded-lg overflow-hidden bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : className}`}>
        {/* Loading overlay while model is loading */}
        {!modelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-95 z-10">
            <div className="relative mb-6">
              <Rotate3D className="w-16 h-16 text-gray-400" />
              <Loader2 className="absolute inset-0 w-16 h-16 text-blue-600 animate-spin" />
            </div>
            
            <div className="text-center space-y-3 max-w-sm">
              <h4 className="text-lg font-semibold text-gray-800">Loading 3D Model</h4>
              <p className="text-sm text-gray-600">
                Downloading and processing your 3D model...
              </p>
              
              {modelSize && (
                <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                  📦 File size: {modelSize}
                </div>
              )}
              
              {/* Progress simulation */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(loadingProgress, 90)}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                </div>
                <span>This may take 10-30 seconds for large models</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white border-b">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">3D Model View</span>
            <span className="text-xs text-gray-500">GLB Format</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-1 h-auto"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
            <Button
              onClick={toggleFullscreen}
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-1 h-auto"
            >
              <Maximize className="w-3 h-3" />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        {/* 3D Model Container */}
        <div className={`relative ${isFullscreen ? 'h-screen' : 'aspect-square'}`} style={{ minHeight: isFullscreen ? 'calc(100vh - 60px)' : '400px' }}>
          {modelUrl && (
            <div 
              className="w-full h-full"
              ref={(el) => {
                if (el && modelUrl && !el.querySelector('model-viewer')) {
                  console.log("🔄 Creating model-viewer element for:", modelUrl)
                  
                  // Create model-viewer element
                  const modelViewer = document.createElement('model-viewer')
                  modelViewer.setAttribute('src', modelUrl)
                  modelViewer.setAttribute('alt', '3D Model')
                  modelViewer.setAttribute('auto-rotate', '')
                  modelViewer.setAttribute('camera-controls', '')
                  modelViewer.setAttribute('interaction-policy', 'always-allow')
                  modelViewer.setAttribute('loading', 'eager')
                  modelViewer.setAttribute('reveal', 'auto')
                  modelViewer.style.backgroundColor = '#262626'
                  modelViewer.style.width = '100%'
                  modelViewer.style.height = '100%'
                  
                  
                  // Add event listeners
                  modelViewer.addEventListener('load', () => {
                    console.log("🎉 Model-viewer load event fired!")
                    handleModelLoad()
                  })
                  
                  modelViewer.addEventListener('error', (event: any) => {
                    console.error("💥 Model-viewer error event:", event)
                    handleModelError(`Model failed to load: ${event.detail || 'Unknown error'}`)
                  })

                  // Additional progress tracking
                  modelViewer.addEventListener('progress', (event: any) => {
                    console.log("📊 Model loading progress:", event.detail)
                    if (event.detail && typeof event.detail.totalProgress === 'number') {
                      setLoadingProgress(event.detail.totalProgress * 100)
                    }
                  })
                  
                  // Clear and append
                  el.innerHTML = ''
                  el.appendChild(modelViewer)
                  
                  console.log("✅ Model-viewer element created and attached")
                }
              }}
            />
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-3 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>🖱️ Click and drag to rotate • 🔍 Scroll to zoom • 📱 Touch to interact</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              modelLoaded 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {modelLoaded ? '✅ Loaded' : '⏳ Loading'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Fullscreen overlay background */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleFullscreen} />
      )}
    </>
  )
}

export default Model3DViewer 