"use client"

import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import { X, Download, Maximize2, Minimize2 } from "lucide-react"
import Model3DViewer from "@modules/products/components/3d-viewer"

interface Cart3DModelPreviewProps {
  modelUrl: string
  productTitle: string
  generatedAt?: string
  predictionId?: string
  apiResponse?: any // Complete API response
}

const Cart3DModelPreview: React.FC<Cart3DModelPreviewProps> = ({
  modelUrl,
  productTitle,
  generatedAt,
  predictionId,
  apiResponse
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = modelUrl
    link.download = `3d-model-${productTitle.replace(/\s+/g, '-')}.glb`
    link.click()
  }

  const handleViewInNewTab = () => {
    window.open(modelUrl, '_blank')
  }

  if (!modelUrl) return null

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
      >
        📱 View 3D Model
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className={`relative bg-white rounded-lg shadow-2xl ${
            isFullscreen ? 'w-full h-full m-0 rounded-none' : 'w-11/12 max-w-4xl h-5/6 m-4'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">3D Model Preview</h3>
                <p className="text-sm text-gray-600">{productTitle}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="flex items-center gap-1 text-sm px-3 py-1 h-auto"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                 */}
                {/* <Button
                  onClick={handleViewInNewTab}
                  variant="secondary"
                  className="flex items-center gap-1 text-sm px-3 py-1 h-auto"
                >
                  <Maximize2 className="w-4 h-4" />
                  New Tab
                </Button> */}
                
                <Button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  variant="secondary"
                  className="flex items-center gap-1 text-sm px-3 py-1 h-auto"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
                
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                  className="flex items-center gap-1 text-sm px-3 py-1 h-auto"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>

            {/* 3D Viewer */}
            <div className={`${isFullscreen ? 'h-full' : 'h-96'} relative`}>
              <Model3DViewer
                modelUrl={modelUrl}
                isLoading={false}
                className="w-full h-full"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-green-600">✅ Ready</span>
                </div>
                
                {generatedAt && (
                  <div>
                    <span className="font-medium text-gray-700">Generated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {predictionId && (
                  <div>
                    <span className="font-medium text-gray-700">Model ID:</span>
                    <span className="ml-2 text-gray-600 font-mono text-xs">
                      {predictionId.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 text-center">
                🎭 Custom generated 3D model • Use mouse to rotate and zoom • Compatible with AR/VR viewers
              </div>
              
              {/* API Response Debug Info */}
              {apiResponse && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    📄 View Complete API Response
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart3DModelPreview 