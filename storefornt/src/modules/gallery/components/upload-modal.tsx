'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '@medusajs/ui';
import { uploadToGallery, GalleryUploadData } from '@lib/data/upload';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@lib/config';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void; // Callback for refreshing gallery
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPG, PNG, GIF, WebP)';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const uploadData: GalleryUploadData = {
        image: selectedFile,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      };
      
      const result = await uploadToGallery(uploadData);
      
      if (result.success) {
        // Reset form and close modal
        setSelectedFile(null);
        setPreviewUrl(null);
        setTitle('');
        setDescription('');
        onClose();
        
        // Call success callback to refresh gallery
        onUploadSuccess?.();
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={handleClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Your Creation</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                onClick={handleClose}
                disabled={isUploading}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                {previewUrl ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setError(null);
                      }}
                      disabled={isUploading}
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PhotoIcon className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="mb-1 text-sm text-gray-600">
                      <span className="font-medium text-purple-600 hover:text-purple-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Give your creation a name"
                  disabled={isUploading}
                  maxLength={100}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Tell us about your creation..."
                  disabled={isUploading}
                  maxLength={500}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedFile || isUploading}
                  className="inline-flex items-center gap-2"
                >
                  {isUploading ? (
                    'Uploading...'
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}