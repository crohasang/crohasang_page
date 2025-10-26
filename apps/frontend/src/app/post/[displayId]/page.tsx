import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { convertUTCtoKST } from '@/lib/dateUtils';
import Image from 'next/image';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

async function getPost(displayId: string) {
  const res = await fetch(`${baseUrl}/api/posts/${displayId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

interface Props {
  params: Promise<{ displayId: string }>;
}

const PostDetailPage = async ({ params }: Props) => {
  const { displayId } = await params;
  const post = await getPost(displayId);
  const kstDate = convertUTCtoKST(post.created_at);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/post">
          <button className="mb-6 text-black-600 hover:text-black-800 font-semibold">
            ←
          </button>
        </Link>

        <article className="bg-transparent">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              #{displayId}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {post.title}
          </h1>

          <p className="text-gray-500 text-sm mb-8">
            {kstDate}
          </p>

          <div className="max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold mt-6 mb-2" {...props} />,
                h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                h3: ({node, ...props}: any) => <h3 className="text-xl font-bold mt-3 mb-1" {...props} />,
                h4: ({node, ...props}: any) => <h4 className="text-lg font-bold mt-2 mb-1" {...props} />,
                pre: ({node, ...props}: any) => <pre className="whitespace-pre-wrap overflow-x-auto bg-gray-100 text-gray-900 p-4 rounded my-2 border border-gray-300" {...props} />,
                code: ({node, inline, ...props}: any) => inline ? 
                    <code className="bg-gray-200 px-2 py-1 rounded text-red-600 font-mono text-sm" {...props} /> :
                    <code className="font-mono text-gray-900" {...props} />,
                blockquote: ({node, ...props}: any) => (
                    <blockquote className="border-l-4 border-gray-400 bg-gray-50 pl-4 py-2 italic my-4 text-gray-700" {...props} />
                ),
                img: ({node, src, alt, ...props}: any) => (
                  <Image
                    src={src}
                    alt={alt || 'post image'}
                    width={400}
                    height={400}
                    className="max-w-full h-auto rounded-lg my-4 block mx-auto"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ),
                a: ({node, ...props}: any) => (
                  <a className="text-gray-600 hover:text-gray-800 underline" {...props} />
                ),
                strong: ({node, ...props}: any) => (
                    <strong className="font-bold text-gray-900" {...props} />
                ),
                em: ({node, ...props}: any) => (
                    <em className="italic text-gray-700" {...props} />
                ),
                ul: ({node, ...props}: any) => (
                    <ul className="list-disc list-inside space-y-0" {...props} />
                ),
                ol: ({node, ...props}: any) => (
                    <ol className="list-decimal list-inside space-y-0" {...props} />
                ),
                li: ({node, ...props}: any) => (
                    <li className="my-0" {...props} />
                ),
                p: ({node, ...props}: any) => {
                  const isInsideLi = node?.parent?.type === 'listItem';
                  return isInsideLi ? 
                    <span className="whitespace-pre-wrap" {...props} /> :
                    <p className="whitespace-pre-wrap my-0" {...props} />;
                },
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PostDetailPage;