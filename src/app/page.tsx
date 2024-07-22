import { Metadata } from 'next';
import IntroduceContent from '@/components/introduce/IntroduceContent';

export const metadata: Metadata = {
  title: 'crohasang',
  description: 'Portfolio web site of Cho hasang',
};

const Page = () => {
  return <IntroduceContent />;
};

export default Page;
