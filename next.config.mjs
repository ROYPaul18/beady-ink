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

  async headers() {
    return [
      {
        // Applique la CSP à toutes les pages
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://apis.google.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' https://res.cloudinary.com data:;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://api.example.com;
              object-src 'none';
              base-uri 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
