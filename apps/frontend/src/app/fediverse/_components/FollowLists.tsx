import type { FollowRelation } from '../_types';

type FollowListsProps = {
  followingList: FollowRelation[];
  followersList: FollowRelation[];
};

export function FollowLists({ followingList, followersList }: FollowListsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Following List */}
      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Following ({followingList.length})</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {followingList.length === 0 ? (
            <p className="text-sm text-gray-500">Not following anyone yet.</p>
          ) : (
            followingList.map((follow) => {
              const account = follow.following;
              if (!account) return null;

              return (
                <div key={follow.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  {account.avatar_url ? (
                    <img
                      src={account.avatar_url}
                      alt={account.display_name || account.username || 'Avatar'}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      {account.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">
                      {account.display_name || account.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{account.username}</p>
                  </div>
                  {account.url && (
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex-shrink-0"
                    >
                      Visit
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Followers List */}
      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Followers ({followersList.length})</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {followersList.length === 0 ? (
            <p className="text-sm text-gray-500">No followers yet.</p>
          ) : (
            followersList.map((follow) => {
              const account = follow.follower;
              if (!account) return null;

              return (
                <div key={follow.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  {account.avatar_url ? (
                    <img
                      src={account.avatar_url}
                      alt={account.display_name || account.username || 'Avatar'}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {account.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">
                      {account.display_name || account.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{account.username}</p>
                  </div>
                  {account.url && (
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex-shrink-0"
                    >
                      Visit
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
