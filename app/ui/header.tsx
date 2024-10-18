"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react"; 
import { usePathname } from "next/navigation";  // Utiliser usePathname pour récupérer la route actuelle

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession(); 
  const pathname = usePathname();  // Obtenez la route actuelle avec usePathname

  // Définir dynamiquement l'image de fond en fonction de la route
  const getBackgroundImage = () => {
    if (pathname === '/tatouage' || pathname === '/tattoo') {
      return '/img/bg-fleur.jpg';
    } else {
      return '/img/bg-feuille.jpg';  // Image par défaut
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Désactiver le scroll si le menu est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";  // Désactiver le scroll
    } else {
      document.body.style.overflow = "auto";  // Réactiver le scroll
    }

    return () => {
      document.body.style.overflow = "auto";  // Toujours réactiver le scroll quand le composant est démonté
    };
  }, [menuOpen]);

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header 
      style={{ backgroundImage: `url(${getBackgroundImage()})` }} // Utilisation du style inline pour définir l'image de fond
      className={`relative bg-cover bg-center ${menuOpen ? "h-screen" : "h-auto"}`}
    >
      <div className="flex justify-between items-center p-4 relative z-50">
        <h1 className="text-3xl lg:text-6xl font-bold md:text-center md:flex-grow text-white">
          Beaudy Ink
        </h1>
        <p>{session?.user?.nom}</p>
        <button
          className="block lg:hidden text-3xl focus:outline-none text-white"
          onClick={toggleMenu}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <nav
        className={`${
          menuOpen 
            ? "fixed top-0 left-0 w-full h-screen z-40 flex flex-col items-center justify-center bg-cover bg-center pt-20"
            : "hidden"
        } lg:flex lg:relative lg:justify-center lg:items-center p-4 lg:p-0 lg:pt-0`}
      >
        {/* Liens de navigation */}
        <div className="flex flex-col items-center lg:flex-row lg:gap-4 lg:justify-center lg:w-full lg:ml-20 lg:mr-20">
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/" onClick={closeMenu}>Accueil</Link>
          </h1>
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/onglerie" onClick={closeMenu}>Onglerie</Link>
          </h1>
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/tatouage" onClick={closeMenu}>Tatouage</Link>
          </h1>
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/tattoo" onClick={closeMenu}>Flash Tattoo</Link>
          </h1>
        </div>

        {/* Icône utilisateur et bouton "Réserver maintenant" */}
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:absolute lg:right-4 relative">
          <div className="relative">
            <button onClick={toggleDropdown}>
              {/* Icône SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50 w-48">
                <ul className="flex flex-col text-center space-y-4">
                  {!isAuthenticated && (
                    <li>
                      <Link href="/sign-up" onClick={() => {closeDropdown(); closeMenu();}} className="block bg-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all">
                        Se créer un compte
                      </Link>
                    </li>
                  )}

                  <li>
                    {isAuthenticated ? (
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          signOut({
                            redirect: true,
                            callbackUrl: '/'
                          });
                          closeDropdown();
                          closeMenu();  // Close menu on sign out
                        }}
                        className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-green transition-all"
                      >
                        Se déconnecter
                      </Link>
                    ) : (
                      <Link 
                        href="/sign-in" 
                        onClick={() => {
                          closeDropdown();
                          closeMenu();  // Close menu when navigating to sign-in
                        }} 
                        className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-green transition-all"
                      >
                        Se connecter
                      </Link>
                    )}
                  </li>

                  {isAdmin && (
                    <li>
                      <Link href="/admin" onClick={() => {closeDropdown(); closeMenu();}} className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-green transition-all">
                        Mon dashboard
                      </Link>
                    </li>
                  )}

                  {isAuthenticated && (
                    <li>
                      <Link href="/profile" onClick={() => {closeDropdown(); closeMenu();}} className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-green transition-all">
                        Mon profil & réservations
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button className="text-lg font-bold bg-white text-green rounded-sm px-4 py-1">
            Réserver maintenant
          </button>
        </div>
      </nav>

      <div className="absolute bottom-0 w-full h-[4px] md:h-[6px] gradient-gold z-0"></div>
    </header>
  );
};

export default Header;
