'use client';
import React, { useRef, useEffect, useState } from 'react';
import MusicCard from './MusicCard';
import slides from '@/constants/Slides';
import uuid from 'react-uuid';
import './MusicSlide.css';

const MusicSlide = ({ reverse = false }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const loadedImageCount = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    loadedImageCount.current += 1;

    if (carouselRef.current) {
      if (loadedImageCount.current === slides.length * 3) {
        const cardWidth = 100;
        const cardPadding = 32;
        const totalWidth = (cardWidth + cardPadding) * slides.length * 3;

        const translateValue = `-${totalWidth / 3}px`;
        carouselRef.current.style.setProperty(
          '--carousel-translate',
          translateValue
        );

        setIsLoaded(true);
      }
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleAnimationEnd = () => {
      const firstChild = carousel.firstChild;
      if (firstChild) {
        carousel.appendChild(firstChild);
      }
      carousel.style.animation = 'none';
      requestAnimationFrame(() => {
        carousel.style.animation = '';
      });
    };

    carousel.addEventListener('animationiteration', handleAnimationEnd);

    return () => {
      carousel.removeEventListener('animationiteration', handleAnimationEnd);
    };
  }, []);

  const extendedSlides = [...slides, ...slides, ...slides];

  return (
    <div className="carousel-wrapper">
      <div
        ref={carouselRef}
        className={`carousel-container ${reverse ? 'reverse' : ''} ${
          isLoaded ? 'animate' : ''
        }`}
      >
        {extendedSlides.map((slide) => (
          <MusicCard
            key={uuid()}
            albumCover={slide.albumCover}
            songTitle={slide.songTitle}
            artist={slide.artist}
            onload={handleImageLoad}
          />
        ))}
      </div>
    </div>
  );
};

export default MusicSlide;
