import React from 'react';
import Link from 'next/link';
import { convertUTCtoKST } from '@/lib/dateUtils';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

async function getPost(id: string) {
  const res = await fetch(`${baseUrl}/api/posts/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

interface Props {
  params: Promise<{ id: string }>;
}

const PostDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const post = await getPost(id);
  const kstDate = convertUTCtoKST(post.created_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/post">
          <button className="mb-6 text-black-600 hover:text-black-800 font-semibold">
            ←
          </button>
        </Link>

        <article className="bg-transparent">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              #{post.id}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {post.title}
          </h1>

          <p className="text-gray-500 text-sm mb-8">
            {kstDate}
          </p>

          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.body}
          </div>
        </article>
      </div>
    </div>
  );
};

export default PostDetailPage;