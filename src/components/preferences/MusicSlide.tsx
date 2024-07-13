'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MusicCard from './MusicCard';
import musicArray from '@/constants/MusicArray';
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
    if (loadedImageCount.current === musicArray.length * 3) {
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

  const extendedMusicArray = [...musicArray, ...musicArray, ...musicArray];

  return (
    <div className="overflow-hidden w-full relative">
      <MotionDiv
        ref={carouselRef}
        className="flex"
        style={{ width: `${extendedMusicArray.length * 144}px` }}
        animate={controls}
        initial={true}
      >
        {extendedMusicArray.map((musicArray) => (
          <MusicCard
            key={uuid()}
            albumCover={musicArray.albumCover}
            songTitle={musicArray.songTitle}
            artist={musicArray.artist}
            onLoad={handleImageLoad}
          />
        ))}
      </MotionDiv>
    </div>
  );
};

export default MusicSlide;
