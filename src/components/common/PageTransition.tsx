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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showContent, setShowContent] = useState<boolean>(false);
  const pageInfo = PageDescriptions[pathname] || { name: '', description: '' };

  useEffect(() => {
    if (pathname === '/') {
      setIsLoading(false);
      setShowContent(true);
      return;
    }

    setIsLoading(true);
    setShowContent(false);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(timer);
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
