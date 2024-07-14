'use client';

import { useRef, useState } from 'react';
import MusicCard from './MusicCard';
import uuid from 'react-uuid';

interface MusicSlideProps {
  musicArray: Array<{
    albumCover: string;
    songTitle: string;
    artist: string;
  }>;
  direction: 'left' | 'right';
}

const MusicSlide: React.FC<MusicSlideProps> = ({ musicArray, direction }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedImageCount = useRef(0);

  const handleImageLoad = () => {
    loadedImageCount.current += 1;
    if (loadedImageCount.current === musicArray.length * 2) {
      setIsLoaded(true);
    }
  };

  const extendedMusicArray = [...musicArray, ...musicArray];

  return (
    <div className="overflow-hidden w-full relative">
      <div
        className={`flex ${isLoaded ? '' : 'opacity-0'} ${
          direction === 'left' ? 'animate-slide-left' : 'animate-slide-right'
        }`}
        style={{
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
