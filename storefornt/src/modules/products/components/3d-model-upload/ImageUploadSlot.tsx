import React from "react"
import { Upload, X } from "lucide-react"

interface ImageUploadSlotProps {
  image: File | null
  imageUrl: string | null
  index: number
  currentSlot: number
  isGenerating: boolean
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => void
  onRemoveImage: (index: number) => void
  onError: (error: string) => void
  fileInputRef?: React.RefObject<HTMLInputElement>
}

const ImageUploadSlot: React.FC<ImageUploadSlotProps> = ({
  image,
  imageUrl,
  index,
  currentSlot,
  isGenerating,
  onImageSelect,
  onRemoveImage,
  onError,
  fileInputRef
}) => {
  const slotLabels = ['Main View', 'View 2', 'View 3', 'View 4']

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        {slotLabels[index]}
        <span className="ml-2 text-xs text-gray-500">
          {image ? `✅ ${image.name.slice(0, 15)}...` : '❌ Empty'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onImageSelect(e, index)}
        className="hidden"
        id={`image-upload-${index}`}
        disabled={isGenerating}
      />

      {image && imageUrl ? (
        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
            <img
              src={imageUrl}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => onError(`Failed to load image: ${image.name}`)}
            />
          </div>
          {!isGenerating && (
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
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
}

export default ImageUploadSlot