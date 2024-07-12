interface Props {
  albumCover: string;
  songTitle: string;
  artist: string;
  onLoad: () => void;
}

const MusicCard: React.FC<Props> = ({
  albumCover,
  songTitle,
  artist,
  onLoad,
}) => {
  return (
    <div className="p-4 w-36">
      <div className="aspect-square mb-2 overflow-hidden">
        <img
          src={albumCover}
          alt="Album Cover"
          className="w-full h-full object-cover rounded-lg"
          onLoad={onLoad}
        />
      </div>
      <div className="text-left">
        <h3 className="text-xs font-semibold truncate">{songTitle}</h3>
        <p className="text-xs text-gray-500 truncate">{artist}</p>
      </div>
    </div>
  );
};

export default MusicCard;
