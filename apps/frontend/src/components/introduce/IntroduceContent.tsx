import { SiTistory } from 'react-icons/si';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

const IntroduceContent = () => {
  const menuItems = [
    { label: 'Projects', link: '/projects' },
    { label: 'Preferences', link: '/preferences' },
  ];

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

          <h2 className="text-2xl md:text-3xl mb-2 text-white">
            Web Frontend Developer
          </h2>

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

      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.link}
            className="text-black hover:text-gray-600 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IntroduceContent;