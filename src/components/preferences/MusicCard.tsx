interface Props {
  albumCover: string;
  songTitle: string;
  artist: string;
  onload: () => void;
}

const MusicCard: React.FC<Props> = ({
  albumCover,
  songTitle,
  artist,
  onload,
}) => {
  return (
    <div className="p-8">
      <img
        src={albumCover}
        alt="Album Cover"
        className="w-48 h-24 rounded-t-lg object-contain"
        onLoad={onload}
      />
      <div className="text-left">
        <h3 className="text-xs font-semibold whitespace-nowrap">{songTitle}</h3>
        <p className="text-xs text-gray-500 whitespace-nowrap">{artist}</p>
      </div>
    </div>
  );
};

export default MusicCard;