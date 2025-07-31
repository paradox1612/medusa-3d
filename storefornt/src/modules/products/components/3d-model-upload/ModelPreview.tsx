"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@medusajs/ui"
import { Eye, Download, X, Loader2, RotateCcw } from "lucide-react"

interface ModelPreviewProps {
  modelUrl: string
  onClose: () => void
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ modelUrl, onClose }) => {
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

export default ModelPreview