'use client';

import { useRef, useEffect, useState } from 'react';
import MusicCard from './MusicCard';
import { musicArray } from '@/constants/MusicArray';
import uuid from 'react-uuid';

const MusicSlide = () => {
  // 모든 이미지가 로드되었는지
  const [isLoaded, setIsLoaded] = useState(false);

  // 로드된 이미지 갯수를 추적하는 ref
  const loadedImageCount = useRef(0);

  // 각 이미지가 로드될 때마다 호출되는 함수
  const handleImageLoad = () => {
    loadedImageCount.current += 1;

    // 모든 이미지가 로드되면 isLoaded 상태를 true로 설정
    if (loadedImageCount.current === musicArray.length * 2) {
      setIsLoaded(true);
    }
  };

  // 음악 배열을 2번 반복
  const extendedMusicArray = [...musicArray, ...musicArray];

  return (
    <div className="overflow-hidden w-full relative">
      <div
        // isLoaded 상태에 따라 opacity를 조절하여 모든 이미지가 로드될 때까지 슬라이드를 숨김
        className={`flex animate-slide ${isLoaded ? '' : 'opacity-0'}`}
        style={{
          // 각 카드의 너비(144px)에 카드 개수를 곱하여 전체 너비 설정
          width: `${extendedMusicArray.length * 144}px`,
        }}
      >
        {extendedMusicArray.map((music) => (
          <MusicCard
            key={uuid()}
            albumCover={music.albumCover}
            songTitle={music.songTitle}
            artist={music.artist}
            onLoad={handleImageLoad}
          />
        ))}
      </div>
    </div>
  );
};

export default MusicSlide;
