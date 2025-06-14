"use client";

import { useRef, useState } from "react";
import MusicCard from "./MusicCard";
import { v4 as uuidv4 } from "uuid";

interface MusicSlideProps {
  musicArray: Array<{
    albumCover: string;
    songTitle: string;
    artist: string;
  }>;
  direction: "left" | "right";
}

const MusicSlide = ({ musicArray, direction }: MusicSlideProps) => {
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
        className={`flex ${isLoaded ? "" : "opacity-0"} ${
          direction === "left" ? "animate-slide-left" : "animate-slide-right"
        }`}
        style={{
          width: `${extendedMusicArray.length * 144}px`,
        }}
      >
        {extendedMusicArray.map((music) => (
          <MusicCard
            key={uuidv4()}
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
