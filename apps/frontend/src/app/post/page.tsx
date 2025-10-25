import React from 'react';
import Link from 'next/link';
import { convertUTCtoKSTDate } from '@/lib/dateUtils';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

async function getPosts() {
  const res = await fetch(`${baseUrl}/api/posts`, { cache: 'no-store' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to fetch posts: ${JSON.stringify(errorData)}`);
  }
  return res.json();
}

const Page = async () => {
  const posts = await getPosts();
  const sortedPosts = posts.sort((a: any, b: any) => b.id - a.id);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="space-y-0">
          {sortedPosts.map((post: any) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="group border-b border-gray-200 hover:bg-blue-50 transition-colors py-4 px-4 cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                        #{post.id}
                      </span>
                      <h2 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {post.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {convertUTCtoKSTDate(post.created_at)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;