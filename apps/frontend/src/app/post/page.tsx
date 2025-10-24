import React from 'react';

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

  return (
    <div>
      {posts.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}
    </div>
  );
};

export default Page;