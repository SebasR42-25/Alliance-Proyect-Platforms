import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Fix: evita el warning de workspace root de Turbopack
  // cuando hay varios package-lock.json en el árbol de directorios
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
