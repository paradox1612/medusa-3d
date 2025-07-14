'use client'

import { useState } from 'react';
import { Button } from '@medusajs/ui';
import GalleryGrid from '@modules/gallery/components/gallery-grid';
import UploadModal from '@modules/gallery/components/upload-modal';

export default function GalleryPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Community Gallery</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover amazing creations from our community of artists and creators.
          </p>
          <div className="mt-8">
            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Share Your Creation
            </Button>
          </div>
        </div>

        <GalleryGrid />
        
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
        />
      </div>
    </div>
  );
}
