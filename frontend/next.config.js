/** @type {import('next').NextConfig} */

const uploadPatterns = [
  {
    protocol: 'https',
    hostname: 'api.g2bulk.com',
    pathname: '/images/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '4000',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '4000',
    pathname: '/uploads/**',
  },
  {
    protocol: 'https',
    hostname: 'api.rankage.shop',
    pathname: '/uploads/**',
  },
];

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
    const exists = uploadPatterns.some(
      (pattern) =>
        pattern.hostname === apiUrl.hostname &&
        pattern.pathname === '/uploads/**' &&
        pattern.protocol === apiUrl.protocol.replace(':', ''),
    );
    if (!exists) {
      uploadPatterns.push({
        protocol: apiUrl.protocol.replace(':', ''),
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
        pathname: '/uploads/**',
      });
    }
  } catch {
    // ignore invalid env URL
  }
}

const nextConfig = {
  images: {
    remotePatterns: uploadPatterns,
  },
};

module.exports = nextConfig;
