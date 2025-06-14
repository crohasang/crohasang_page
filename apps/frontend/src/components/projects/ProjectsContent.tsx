'use client';

import { motion } from 'framer-motion';
import ProjectCard from '@/components/projects/ProjectCard';
import { ProjectsContentProps } from '@/types/projects';

const ProjectsContent = ({ title, projects }: ProjectsContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </div>
      <hr className="mt-8 border-t border-gray-300" />
    </motion.div>
  );
};

export default ProjectsContent;
