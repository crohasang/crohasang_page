/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['d1faf0kcj4x8qr.cloudfront.net'],
  },
  async rewrites() {
    const backend = process.env.FEDIVERSE_BACKEND_URL;

    if (!backend) {
      return [];
    }

    return [
      { source: '/.well-known/:path*', destination: `${backend}/.well-known/:path*` },
      { source: '/users/:path*', destination: `${backend}/users/:path*` },
      { source: '/inbox', destination: `${backend}/inbox` },
      { source: '/inbox/:path*', destination: `${backend}/inbox/:path*` },
      { source: '/micro-posts', destination: `${backend}/micro-posts` },
      { source: '/micro-posts/:path*', destination: `${backend}/micro-posts/:path*` },
    ];
  },
};

export default nextConfig;