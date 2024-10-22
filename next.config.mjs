/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['res.cloudinary.com'],
      staticPageGenerationTimeout: 120,
    },
  };
  
  export default nextConfig;