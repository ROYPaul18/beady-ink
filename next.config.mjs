/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dqdvhe7du/**', // Spécifique à votre dossier Cloudinary
      },
    ],
  },
  productionBrowserSourceMaps: false,

  // Retirer temporairement les headers CSP

};

export default nextConfig;
