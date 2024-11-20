'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname(); // Use usePathname to get the current route

  // Function to get the background image based on the current route
  const getBackgroundImage = () => {
    if (pathname === '/tatouage' || pathname === '/tattoo' || pathname === '/reservation/tatouage' || pathname === '/reservation/flashtattoo') {
      return '/img/bg-fleur.jpg'; // Specific image for tattoo pages
    } else {
      return '/img/bg-feuille.jpg'; // Default image
    }
  };

  return (
    <footer className="relative bg-cover bg-center py-6 w-full">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={getBackgroundImage()}
          alt="Background image"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Golden stripe */}
      <div className="absolute top-0 w-full h-[4px] md:h-[6px] gradient-gold"></div>

      {/* Main container - adjusted for mobile */}
      <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center relative z-10">
        {/* Central part: Name, Legal mentions */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl text-white font-bold mb-3">
            Beaudy Ink
          </h1>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-2 text-white text-xs sm:text-sm">
            <p>© 2024 Beaudy Ink</p>
            <span className="hidden sm:inline">|</span>
            <Link
              href="/"
              className="underline hover:text-gray-200 transition-colors"
            >
              Mentions légales
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link
              href="/"
              className="underline hover:text-gray-200 transition-colors"
            >
              Site réalisé par Paul ROY
            </Link>
          </div>
        </div>

        {/* Social media part - reorganized for mobile */}
        <div className="flex justify-center items-center gap-4">
          <a href="/" className="transition-transform hover:scale-110">
            {/* Facebook Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="fill-current text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            >
              <path d="M22.675 0h-21.35c... (your SVG path data here)" />
            </svg>
          </a>

          <div className="text-center">
            <h2 className="text-white font-black text-xs sm:text-sm">
              Beaudy Ink
            </h2>
            <h2 className="text-white font-black text-xs sm:text-sm">
              Beaudy Ink Tattoo
            </h2>
          </div>

          <a href="/" className="transition-transform hover:scale-110">
            {/* Instagram Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="fill-current text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            >
              <path d="M12 2.163c... (your SVG path data here)" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
