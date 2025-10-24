import { SiTistory } from 'react-icons/si';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

const IntroduceContent = () => {

  return (
    <div
      className="fixed inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://d1faf0kcj4x8qr.cloudfront.net/background/blue_sky.jpg')`,
      }}
    >
      <div
        className="flex justify-end items-start h-full pr-4 pt-4 md:pr-16 md:pt-16"
      >
        <div className="text-right">
          
          <h1
            className="text-3xl md:text-4xl mt-2 mb-2 text-white"
          >
            Cho Hasang
          </h1>

          <div className="text-lg md:text-xl mb-2 text-white">
            Web Developer
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <a
              href="https://quickchabun.tistory.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-white hover:text-gray-200 transition-colors"
            >
              <SiTistory />
            </a>
            <a
              href="https://github.com/crohasang"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-white hover:text-gray-200 transition-colors"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/hasang-cho/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-white hover:text-gray-200 transition-colors"
            >
              <FaLinkedin />
            </a>
          </div>
            
        </div>
      </div>
    </div>
  );
};

export default IntroduceContent;