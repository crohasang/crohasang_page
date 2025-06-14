'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import PageDescriptions from '@/constants/PageDescription';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(pathname !== '/');
  const [showContent, setShowContent] = useState<boolean>(pathname === '/');
  const pageInfo = PageDescriptions[pathname] || { name: '', description: '' };

  useEffect(() => {
    if (pathname === '/') {
      // 메인 페이지('/')일 경우
      setIsLoading(false); // 로딩 상태를 즉시 false로 설정
      setShowContent(true); // 콘텐츠를 즉시 표시
    } else {
      // 메인 페이지가 아닌 경우
      setIsLoading(true); // 로딩 상태를 true로 설정
      setShowContent(false); // 콘텐츠를 숨김

      // 2초 후에 로딩을 끝내고 콘텐츠를 표시하는 타이머 설정
      const timer = setTimeout(() => {
        setIsLoading(false); // 로딩 상태를 false로 변경
        setShowContent(true); // 콘텐츠를 표시
      }, 2000);

      // 컴포넌트가 언마운트되거나 pathname이 바뀔 때 타이머를 정리
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col justify-center items-center text-white z-50"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold"
            >
              {pageInfo.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-300 text-sm mt-2"
            >
              {pageInfo.description}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      {showContent && children}
    </>
  );
};

export default PageTransition;
