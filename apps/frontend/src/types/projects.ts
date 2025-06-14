export type ProjectCardProps = {
  title: string;
  imageUrl: string;
  techStack: string[];
  duration: string;
  description: string;
  link: string;
};

export type ProjectsContentProps = {
  title: string;
  projects: ProjectCardProps[];
};
