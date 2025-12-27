import type { TimelineItem } from '../_types';

type TimelineFeedProps = {
  timeline: TimelineItem[];
};

export function TimelineFeed({ timeline }: TimelineFeedProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Following Timeline</h2>

      <div className="space-y-6">
        {timeline.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-600">No timeline items yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Follow someone and their posts will appear here!
            </p>
          </div>
        ) : (
          timeline.map((item) => {
            const content =
              item.raw_data?.object?.content ||
              (item.raw_data?.object?.contentMap
                ? Object.values(item.raw_data.object.contentMap)[0]
                : 'No content');

            const published = item.raw_data?.object?.published
              ? new Date(item.raw_data.object.published).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })
              : new Date(item.created_at).toLocaleString('ko-KR');

            return (
              <article
                key={item.id}
                className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {item.actor?.avatar_url ? (
                    <img
                      src={item.actor.avatar_url}
                      alt={item.actor.display_name || item.actor.username || 'Avatar'}
                      className="w-12 h-12 rounded-full object-cover shadow-inner"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {item.actor?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 truncate">
                      {item.actor?.display_name || item.actor?.username || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-500 truncate">
                      @{item.actor?.username}
                    </span>
                    <span className="text-gray-300 text-xs">•</span>
                    <time className="text-xs text-gray-400" dateTime={item.created_at}>
                      {published}
                    </time>
                  </div>

                  <div
                    className="prose prose-sm max-w-none text-gray-800 break-words [&>p]:mb-2 [&>p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />

                  <div className="mt-3 flex gap-4">
                    {item.actor?.url && (
                      <a
                        href={item.actor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
