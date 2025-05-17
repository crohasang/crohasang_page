'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiTistory } from 'react-icons/si';
import VideoCarousel from './VideoCarousel';

const IntroduceContent = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className="mx-auto px-4 py-8 max-w-4xl"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-8"
      >
        <motion.div
          variants={item}
          className="w-64 h-64 relative overflow-hidden"
        >
          <Image
            src="https://d1faf0kcj4x8qr.cloudfront.net/profile/profile.JPG"
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </motion.div>

        <div className="flex-1">
          <motion.h1
            variants={item}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Cho Hasang
          </motion.h1>

          <motion.h2 variants={item} className="text-2xl md:text-3xl mb-4">
            Web Frontend Developer
          </motion.h2>

          <motion.h3
            variants={item}
            className="text-slate-600 font-light text-lg md:text-xl mb-6"
          >
            hasang2691@gmail.com
          </motion.h3>

          <motion.div variants={container} className="space-y-3">
            <motion.p variants={item}>
            🎓 Konkuk University, Department of Computer Engineering
            </motion.p>
            <motion.p variants={item}>
              💻 Web Member of KUIT, 2nd Generation (University Development
              Club)
            </motion.p>
            <motion.p variants={item}>
              👨‍💻 Web Part Leader of KUIT, 3rd Generation
            </motion.p>
            <motion.p variants={item}>
              👥 President of KUIT, 4th Generation
            </motion.p>
            <motion.p variants={item}>
              🏢 Web Frontend Intern at Diningcode (2025.03 - 2025.06)
            </motion.p>
          </motion.div>

          <motion.div variants={item} className="mt-6 flex space-x-4">
            <a
              href="https://quickchabun.tistory.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              <SiTistory />
            </a>
            <a
              href="https://github.com/crohasang"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/hasang-cho/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FaLinkedin />
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.hr variants={item} className="my-12 border-t border-gray-300" />

      <motion.div variants={item} className="mt-12">
        <VideoCarousel />
      </motion.div>
    </motion.div>
  );
};

export default IntroduceContent;
