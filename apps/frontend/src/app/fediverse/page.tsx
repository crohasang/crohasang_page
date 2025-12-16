type Actor = {
  id: string;
  type: string;
  name?: string;
  preferredUsername?: string;
  summary?: string;
  inbox?: string;
  outbox?: string;
  followers?: string;
  published?: string;
  url?: string;
};

type MicroPost = {
  id: number;
  actor_id: string;
  content: string;
  content_html?: string;
  visibility: string;
  created_at: string;
  updated_at: string;
};

type FollowersCollection = {
  totalItems?: number;
  items?: unknown[];
  orderedItems?: unknown[];
  first?: unknown;
};

async function getActor(): Promise<Actor> {
  const res = await fetch(`https://crohasang.com/users/crohasang`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/activity+json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch actor');
  }

  return res.json();
}

async function getMicroPosts(): Promise<MicroPost[]> {
  const res = await fetch(`https://crohasang.com/micro-posts`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch micro-posts');
  }

  return res.json();
}

async function getFollowersCollection(followersUrl?: string): Promise<FollowersCollection | null> {
  if (!followersUrl) {
    return null;
  }

  const res = await fetch(followersUrl, {
    cache: 'no-store',
    headers: {
      Accept: 'application/activity+json',
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function FediversePage() {
  const actor = await getActor();
  const [followersCollection, microPosts] = await Promise.all([
    getFollowersCollection(actor.followers),
    getMicroPosts(),
  ]);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fediverse Debugging page</h1>
            <p className="mt-2 text-sm text-gray-600">@crohasang@crohasang.com</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900">Actor Response</h2>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">{JSON.stringify(actor, null, 2)}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900">Followers collection Response</h2>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
              {JSON.stringify(followersCollection ?? { error: 'No followers collection or fetch failed' }, null, 2)}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Micro-posts</h2>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">{JSON.stringify(microPosts, null, 2)}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
