import ProjectsContent from '@/components/projects/ProjectsContent';
import {
  WebFrontEndArray,
  NomadCoderArray,
  JetpackComposeArray,
} from '@/constants/ProjectArray';

export const metadata = {
  title: 'crohasang | Projects',
  description: 'Introduce my projects',
};

const Page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectsContent
        title="Web Frontend Projects"
        projects={WebFrontEndArray}
      />
      <ProjectsContent
        title="NomadCoder Projects (Clone Coding)"
        projects={NomadCoderArray}
      />
      <ProjectsContent
        title="Jetpack Compose Projects"
        projects={JetpackComposeArray}
      />
    </div>
  );
};

export default Page;
