'use client';

import React, { useRef, useEffect, useState } from 'react';
import MusicCard from './MusicCard';
import slides from '@/constants/Slides';
import uuid from 'react-uuid';
import './MusicSlide.css';

const MusicSlide = ({ reverse = false }) => {
  const carouselRef = useRef<HTMLDivElement>(null); // 캐러셀의 참조를 저장할 useRef를 선언
  const loadedImageCount = useRef(0); // 로드된 이미지 수를 저장할 useRef를 선언
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    // 이미지가 로드될 때 호출되는 함수
    loadedImageCount.current += 1; // 로드된 이미지 수를 1 증가

    // console.log로 잘 실행되나 검사해보기
    console.log(
      `Image loaded: ${loadedImageCount.current}/${slides.length * 3}`
    );

    if (carouselRef.current) {
      console.log('carouselRef.current 진입');
      // 캐러셀 참조가 존재할 때만 아래 코드를 실행
      if (loadedImageCount.current === slides.length * 3) {
        // 모든 이미지가 로드되었는지 확인
        const cardWidth = 100; // 카드의 너비를 설정합니다.
        const cardPadding = 32; // 카드의 패딩을 설정합니다.
        const totalWidth = (cardWidth + cardPadding) * slides.length * 3; // 전체 너비를 계산

        const translateValue = `-${totalWidth / 3}px`; // 캐러셀을 이동할 값을 계산
        carouselRef.current.style.setProperty(
          // CSS 변수를 설정하여 캐러셀을 이동
          '--carousel-translate',
          translateValue
        );

        setIsLoaded(true); // 로딩 상태를 true로 설정
      }
    }
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 실행되는 효과
    const carousel = carouselRef.current; // 캐러셀 참조를 가져옴
    console.log('isLoaded : ' + isLoaded);
    console.log('carousel : ' + carousel);

    if (!carousel) return; // 캐러셀 참조가 없으면 종료

    const handleAnimationEnd = () => {
      // 애니메이션이 끝날 때 호출되는 함수
      const firstChild = carousel.firstChild; // 첫 번째 자식을 가져옴

      if (firstChild) {
        // 첫 번째 자식이 존재하면
        carousel.appendChild(firstChild); // 첫 번째 자식을 끝으로 이동
      }
      carousel.style.animation = 'none'; // 애니메이션을 일시적으로 비활성화

      requestAnimationFrame(() => {
        // 다음 프레임에 애니메이션을 재활성화
        carousel.style.animation = '';
      });
    };

    carousel.addEventListener('animationiteration', handleAnimationEnd); // 애니메이션 반복 이벤트 리스너를 추가

    return () => {
      // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
      carousel.removeEventListener('animationiteration', handleAnimationEnd);
    };
  }, []);

  const extendedSlides = [...slides, ...slides, ...slides]; // 슬라이드를 3배 확장

  return (
    <div className="carousel-wrapper">
      <div
        ref={carouselRef}
        className={`carousel-container ${reverse ? 'reverse' : ''} ${
          // reverse와 isLoaded 상태에 따라 클래스명을 설정
          isLoaded ? 'animate' : ''
        }`}
      >
        {extendedSlides.map(
          (
            slide // 확장된 슬라이드 배열을 반복하여 MusicCard 컴포넌트를 렌더링
          ) => (
            <MusicCard
              key={uuid()}
              albumCover={slide.albumCover}
              songTitle={slide.songTitle}
              artist={slide.artist}
              onLoad={handleImageLoad}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MusicSlide;
