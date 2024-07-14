import MusicSlide from '@/components/preferences/MusicSlide';
import { musicArray, musicArray2, musicArray3 } from '@/constants/MusicArray';

export const metadata = {
  title: 'crohasang | preferences',
  description: 'Introduce my preferences',
};

const Page = () => {
  return (
    <>
      <div className="mx-4 overflow-x-hidden">
        <div className="text-xl font-bold mb-4">Music</div>
        <MusicSlide musicArray={musicArray} direction="left" />
        <div className="my-2" />
        <MusicSlide musicArray={musicArray2} direction="right" />
        <div className="my-2" />
        <MusicSlide musicArray={musicArray3} direction="left" />
      </div>
    </>
  );
};

export default Page;
