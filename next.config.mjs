/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      'motion',
      'gsap',
      'lucide-react',
      '@tabler/icons-react',
      '@mui/material',
      '@mui/icons-material',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jbymoblt3fzt0jez.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.codepen.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Google Drive direct image hosting (if used elsewhere with next/image)
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "drive.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
