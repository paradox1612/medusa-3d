'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@medusajs/ui';
import Image from 'next/image';
import { getGalleryItems, GalleryItem } from '../../../lib/data/upload';

export default function GalleryGrid() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchGalleryImages = async (offset = 0, append = false) => {
    try {
      if (offset === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      const data = await getGalleryItems({
        limit: 12,
        offset,
        status: 'approved' // Only show approved images
      });
      
      if (append) {
        setImages(prev => [...prev, ...data.items]);
      } else {
        setImages(data.items);
      }
      
      // Check if there are more items to load
      setHasMore((offset + data.items.length) < data.count);
      
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setError('Failed to load gallery. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchGalleryImages(images.length, true);
    }
  };

  if (isLoading && images.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchGalleryImages();
          }}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No approved images in the gallery yet.</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share your creation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <Image
              src={image.image_url}
              alt={image.title || 'Gallery image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              {image.title && (
                <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                  {image.title}
                </h3>
              )}
              {image.description && (
                <p className="text-gray-200 text-xs line-clamp-3 mb-2">
                  {image.description}
                </p>
              )}
              <p className="text-gray-300 text-xs">
                {new Date(image.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              'Load More Images'
            )}
          </button>
        </div>
      )}

      {/* Loading More Skeleton */}
      {isLoadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={`loading-${i}`} className="aspect-square rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}