import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 本番ビルド時のみ export モードを有効化
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
