import { Metadata } from 'next';
import IntroduceContent from '@/components/introduce/IntroduceContent';

export const metadata: Metadata = {
  title: 'crohasang',
  description: 'Personal website of crohasang',
};

const Page = () => {
  return <IntroduceContent />;
};

export default Page;
