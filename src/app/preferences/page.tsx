import MusicSlide from '@/components/preferences/MusicSlide';

export const metadata = {
  title: 'crohasang | preferences',
  description: 'Introduce my preferences',
};

const Page = () => {
  return (
    <>
      <div className="mx-4 overflow-x-hidden">
        <div className="text-xl font-bold">Music</div>
        <MusicSlide />
        <div className="text-xl font-bold">Movie</div>
      </div>
    </>
  );
};

export default Page;
