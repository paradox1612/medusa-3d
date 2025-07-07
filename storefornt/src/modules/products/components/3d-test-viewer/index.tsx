"use client"

import React from "react"
import Model3DViewer from "../3d-viewer"

const Test3DViewer = () => {
  // Test with the latest GLB URL from your backend response
  const testModelUrl = "https://minio.mersate.com/mersate/3d_model_b87ef301-c482-435d-b8cb-55a1089670ad-01JZJAD0WEXF85KZT8N2FFPJD0.glb"
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">3D Model Viewer Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">Test Model URL:</h2>
          <p className="text-sm text-blue-700 break-all">{testModelUrl}</p>
        </div>
        
        <Model3DViewer 
          modelUrl={testModelUrl}
          isLoading={false}
          className="min-h-[600px]"
        />
      </div>
    </div>
  )
}

export default Test3DViewer 