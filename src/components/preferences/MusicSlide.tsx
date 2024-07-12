'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MusicCard from './MusicCard';
import slides from '@/constants/Slides';
import uuid from 'react-uuid';
import { useAnimation } from 'framer-motion';

const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);

const MusicSlide = ({ reverse = false }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const loadedImageCount = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const controls = useAnimation();

  const handleImageLoad = () => {
    loadedImageCount.current += 1;
    if (loadedImageCount.current === slides.length * 3) {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      controls.start({
        x: reverse ? 0 : -1000,
        transition: {
          x: {
            duration: 10,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        },
      });
    }
  }, [isLoaded, controls, reverse]);

  const extendedSlides = [...slides, ...slides, ...slides];

  return (
    <div className="overflow-hidden w-full relative">
      <MotionDiv
        ref={carouselRef}
        className="flex"
        style={{ width: `${extendedSlides.length * 144}px` }}
        animate={controls}
        initial={true}
      >
        {extendedSlides.map((slide) => (
          <MusicCard
            key={uuid()}
            albumCover={slide.albumCover}
            songTitle={slide.songTitle}
            artist={slide.artist}
            onLoad={handleImageLoad}
          />
        ))}
      </MotionDiv>
    </div>
  );
};

export default MusicSlide;
