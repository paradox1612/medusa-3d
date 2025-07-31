import React, { useRef } from "react"
import { Button } from "@medusajs/ui"
import { Upload } from "lucide-react"

interface MultiFileUploadProps {
  onMultipleFilesSelect: (files: FileList) => void
  isGenerating: boolean
  disabled?: boolean
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  onMultipleFilesSelect,
  isGenerating,
  disabled = false
}) => {
  const multiFileInputRef = useRef<HTMLInputElement>(null)

  const handleMultiFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onMultipleFilesSelect(files)
    }
    // Reset the input
    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = ""
    }
  }

  const triggerMultiFileSelect = () => {
    multiFileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-3 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
      <input
        ref={multiFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleMultiFileSelect}
        className="hidden"
        disabled={isGenerating || disabled}
      />
      
      <div className="text-center">
        <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-blue-700 mb-1">Quick Upload</h4>
        <p className="text-xs text-blue-600 mb-3">
          Select 1-4 images at once from your device
        </p>
      </div>

      <Button
        variant="secondary"
        onClick={triggerMultiFileSelect}
        disabled={isGenerating || disabled}
        className="flex items-center gap-2 text-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        Choose Images (1-4)
      </Button>

      <p className="text-xs text-gray-500 text-center max-w-xs">
        💡 Tip: Hold Ctrl (Cmd on Mac) and click to select multiple images, 
        or drag to select a range of images
      </p>
    </div>
  )
}

export default MultiFileUpload