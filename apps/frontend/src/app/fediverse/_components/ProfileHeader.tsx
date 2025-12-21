import type { Actor } from '../_types';

type ProfileHeaderProps = {
  actor: Actor;
  followingCount: number;
  followersCount: number;
};

export function ProfileHeader({ actor, followingCount, followersCount }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {actor.name || actor.preferredUsername}
      </h1>
      <p className="text-gray-600">@{actor.preferredUsername}@crohasang.com</p>

      {/* Stats Row */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex gap-1">
          <span className="font-bold text-gray-900">{followingCount}</span>
          <span className="text-gray-600">Following</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold text-gray-900">{followersCount}</span>
          <span className="text-gray-600">Followers</span>
        </div>
      </div>
    </div>
  );
}
