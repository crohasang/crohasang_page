'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import { ProjectCardProps } from '@/types/projects';

const ProjectCard = ({
  title,
  imageUrl,
  techStack,
  duration,
  description,
  link,
}: ProjectCardProps) => {
  return (
    <Link
      href={link}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
    >
      <div className="relative w-full h-0 pb-[56.25%]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          style={{ objectFit: 'contain' }}
          className="p-2"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex items-center text-gray-600 mb-2">
          <FaCalendarAlt className="mr-2" />
          <span>{duration}</span>
        </div>
        <p className="text-gray-700">{description}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;
