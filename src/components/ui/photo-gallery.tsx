'use client';

import React, { useState, memo, useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface Photo {
  url: string;
  title?: string;
}

const DUMMY_PHOTOS: Photo[] = [
  {
    url: '/avatars/powerpuff.png',
    title: 'Powerpuff Girls'
  },
  {
    url: '/avatars/buggbunny.jpg',
    title: 'Bugs Bunny'
  },
  {
    url: '/avatars/taz.jpg',
    title: 'Taz The Tazmanian Devil'
  },
  {
    url: '/avatars/johnnybravo.jpg',
    title: 'Johnny Bravo'
  },
  {
    url: '/avatars/courage.jpg',
    title: 'Courage The Cowardly Dog'
  },
  {
    url: '/avatars/kick.jpg',
    title: 'Kick Buttowski'
  },
  {
    url: '/avatars/phineas.jpg',
    title: 'Phineas'
  },
  {
    url: '/avatars/platypus.jpg',
    title: 'Platypus Perry'
  },
  {
    url: '/avatars/dexter.jpg',
    title: 'Dexter'
  }
];

const Vignette = memo(() => {
  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none"
      style={{
        background:
          'linear-gradient(to right, #111111 0%, transparent 10%, transparent 90%, #111111 100%)',
        willChange: 'auto'
      }}
    ></div>
  );
});
Vignette.displayName = 'Vignette';

const SelectedPhotoItem = memo(
  ({
    selectedPhoto,
    setSelectedPhoto,
    photos,
    selectedPhotoIndex
  }: {
    selectedPhoto: { rowIndex: number; index: number };
    setSelectedPhoto: (photo: { rowIndex: number; index: number } | null) => void;
    photos: Photo[];
    selectedPhotoIndex: number;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0.1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={() => setSelectedPhoto(null)}
        className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center"
      >
        <motion.div
          layout
          layoutId={`photo-${selectedPhoto.rowIndex}-${selectedPhoto.index}`}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-72 h-72 overflow-hidden z-20"
        >
          <Image
            src={photos[selectedPhotoIndex].url}
            alt={photos[selectedPhotoIndex].title || 'Untitled Image'}
            fill
            className="object-cover rounded-3xl border-[8px] border-white"
          />
        </motion.div>
        {photos[selectedPhotoIndex].title && (
          <div className="max-w-72 w-full text-center mt-2 font-medium text-xl flex items-center justify-center text-white">
            <motion.span
              initial={{ opacity: 0.1, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.1, y: 10 }}
              key={`photo-title-${selectedPhoto.rowIndex}-${selectedPhoto.index}`}
              transition={{ duration: 0.2 }}
            >
              {photos[selectedPhotoIndex].title}
            </motion.span>
          </div>
        )}
      </motion.div>
    );
  }
);
SelectedPhotoItem.displayName = 'SelectedPhotoItem';

const PhotoItem = ({
  rowIndex,
  photo,
  index,
  setSelectedPhoto
}: {
  rowIndex: number;
  photo: Photo;
  index: number;
  setSelectedPhoto: (photo: { rowIndex: number; index: number }) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [inView, setInView] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer instead of framer-motion's viewport detection
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={itemRef}
      layout
      layoutId={`photo-${rowIndex}-${index}`}
      key={`photo-${rowIndex}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, delay: 0.05 }
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="h-20 w-20 rounded-xl relative overflow-hidden shrink-0 border-[2px] border-zinc-900 hover:border-zinc-100 cursor-pointer transition-colors duration-75"
      style={{ willChange: 'transform, opacity' }}
      onClick={() => setSelectedPhoto({ rowIndex, index })}
      viewport={{ once: true }}
    >
      {loading && <div className="w-full h-full bg-zinc-800 animate-pulse"></div>}
      {inView && (
        <Image
          src={photo.url}
          alt={photo.title || 'Untitled Image'}
          fill
          className="object-cover"
          onLoad={() => setLoading(false)}
          loading="lazy"
        />
      )}
    </motion.div>
  );
};

const PhotoGallery = ({
  photos = Array.from({ length: 80 }).map((_, index) => DUMMY_PHOTOS[index % DUMMY_PHOTOS.length]),
  rows = 5,
  className = '',
  vignette = true,
  title = 'POV: You had a great childhood'
}: {
  photos?: Photo[];
  rows?: number;
  className?: string;
  vignette?: boolean;
  title?: string;
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<{ rowIndex: number; index: number } | null>(
    null
  );
  const displayPhotos = photos;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedPhotoIndex = selectedPhoto
    ? Math.floor((selectedPhoto.rowIndex * photos.length) / rows) + selectedPhoto.index
    : 0;

  return (
    <div className="flex flex-col gap-6 h-full w-full items-center justify-center">
      <h2 className="text-lg lg:text-xl">{title}</h2>
      <div className="relative h-full w-full overflow-y-hidden p-0">
        {vignette && <Vignette />}
        {selectedPhoto && (
          <SelectedPhotoItem
            selectedPhoto={selectedPhoto}
            setSelectedPhoto={setSelectedPhoto}
            photos={displayPhotos}
            selectedPhotoIndex={selectedPhotoIndex}
          />
        )}
        <div
          ref={scrollContainerRef}
          className={cn('flex flex-col gap-2 w-full overflow-x-auto h-full relative', className)}
        >
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const currentPhotos = displayPhotos.slice(
              (rowIndex * displayPhotos.length) / rows,
              ((rowIndex + 1) * displayPhotos.length) / rows
            );
            return (
              <div
                key={`row-${rowIndex}`}
                className={cn(
                  'flex items-center gap-2 relative w-full',
                  rowIndex % 2 === 0 ? '-translate-x-8' : ''
                )}
              >
                {currentPhotos.map((photo, index) => (
                  <PhotoItem
                    key={`photo-${rowIndex}-${index}`}
                    rowIndex={rowIndex}
                    photo={photo}
                    index={index}
                    setSelectedPhoto={setSelectedPhoto}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
