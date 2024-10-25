/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary's hostname
        port: '', // Default port (leave empty for standard HTTP/HTTPS)
        pathname: '/dqdvhe7du/**', // Change this to your specific Cloudinary folder or pattern
      },
    ],
  },
  };
  
  export default nextConfig;