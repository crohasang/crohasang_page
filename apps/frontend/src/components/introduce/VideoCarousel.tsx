'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Video {
  link: string;
}

const videos: Video[] = [
  { link: 'https://www.youtube.com/watch?v=wC3TTLsjqjg' },
  { link: 'https://www.youtube.com/watch?v=mG02ydlnN3k' },
  { link: 'https://www.youtube.com/watch?v=9lJXnPIRY_A' },
];

const VideoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + videos.length) % videos.length
    );
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        // 현재 인덱스에 해당하는 비디오로 스크롤
        left: currentIndex * carouselRef.current.offsetWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const getYouTubeEmbedUrl = (link: string) => {
    // 링크에서 videoId 추출
    const videoId = link.split('v=')[1];

    // &의 위치
    const ampersandPosition = videoId.indexOf('&');

    // 추가 매개변수가 있다면
    if (ampersandPosition !== -1) {
      // 그 전까지의 videoId만 사용
      return `https://www.youtube.com/embed/${videoId.substring(
        0,
        ampersandPosition
      )}`;
    }
    // 추가 매개변수가 없다면 전체 videoId만 사용
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-12 px-12">
      <h2 className="text-xl mb-4">강의 영상(Lecture Video)</h2>
      <div className="relative">
        <div ref={carouselRef} className="flex overflow-x-hidden scroll-smooth">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              className="w-full flex-shrink-0 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(video.link)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
                ></iframe>
              </div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full focus:outline-none"
        >
          <FaChevronLeft className="text-4xl text-gray-600 hover:text-gray-800" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full focus:outline-none"
        >
          <FaChevronRight className="text-4xl text-gray-600 hover:text-gray-800" />
        </button>
      </div>
      <div className="flex justify-center mt-4">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoCarousel;
