import { Metadata } from 'next';
import IntroduceContent from '@/components/introduce/IntroduceContent';

export const metadata: Metadata = {
  title: 'crohasang | introduce',
  description: 'Introduce myself',
};

const Page = () => {
  return <IntroduceContent />;
};

export default Page;
