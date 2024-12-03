'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: number;
  nom?: string;
  prenom?: string;
  role?: 'USER' | 'ADMIN';
}

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user as ExtendedUser | undefined;
  const pathname = usePathname();

  const getBackgroundImage = () => {
    if (pathname === '/tatouage' || pathname === '/tattoo' || pathname === '/reservation/tatouage' || pathname === '/reservation/flashtattoo') {
      return '/img/bg-fleur.jpg';
    } else {
      return '/img/bg-feuille.jpg';
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  const isAuthenticated = status === 'authenticated';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className={`relative ${menuOpen ? 'h-screen' : 'h-auto'}`}>
      <div className="absolute inset-0 -z-10">
        <Image
          src={getBackgroundImage()}
          alt="Background image"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <div className="flex justify-between items-center p-4 relative z-10">
        <h1 className="text-3xl lg:text-6xl font-bold md:text-center md:flex-grow text-white">
          Beaudy Ink
        </h1>
        <p className="text-white">{user?.nom}</p>
        <button
          className="block lg:hidden text-3xl focus:outline-none text-white"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <nav className={`${
          menuOpen
            ? 'fixed top-0 left-0 w-full h-screen z-40 flex flex-col items-center justify-center bg-cover bg-center'
            : 'hidden'
        } lg:flex lg:relative lg:justify-center lg:items-center p-4 lg:p-0 lg:pt-0 relative z-10`}>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-4 lg:justify-center lg:w-full lg:mx-20">
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/" onClick={closeMenu}>
              Accueil
            </Link>
          </h1>
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/onglerie" onClick={closeMenu}>
              Onglerie
            </Link>
          </h1>
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/tatouage" onClick={closeMenu}>
              Tatouage
            </Link>
          </h1>
          <h1 className="text-2xl p-4 text-center text-white">
            <Link href="/tattoo" onClick={closeMenu}>
              Flash Tattoo
            </Link>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-4 lg:absolute lg:right-4 relative">
          <div className="relative">
          <div className="flex flex-col gap-4 lg:hidden rounded-lg">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/sign-up"
                    onClick={closeMenu}
                    className="block sm:bg-white bg-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all hover:bg-white hover:text-green border-2 border-green text-center"
                  >
                    Se créer un compte
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="block border-2 sm:bg-white border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all text-center"
                  >
                    Se connecter
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block border-2 bg-white border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all text-center"
                  >
                    Mon profil & réservations
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="block border-2 bg-white border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all text-center"
                    >
                      Mon dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut({
                        redirect: true,
                        callbackUrl: '/',
                      });
                      closeMenu();
                    }}
                    className="block border-2 border-green bg-green text-white px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all w-full text-center"
                  >
                    Se déconnecter
                  </button>
                </>
              )}
            </div>

            <button onClick={toggleDropdown} className="hidden lg:block" aria-label="Ouvrir le menu utilisateur">
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
                <ul className="flex flex-col text-center space-y-4 bg-white">
                  {!isAuthenticated && (
                    <li>
                      <Link
                        href="/sign-up"
                        onClick={() => {
                          closeDropdown();
                          closeMenu();
                        }}
                        className="block bg-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all hover:bg-white hover:text-green border-2 border-green"
                      >
                        Se créer un compte
                      </Link>
                    </li>
                  )}

                  <li className="hover:bg-green hover:text-white">
                    {isAuthenticated ? (
                      <button
                        onClick={() => {
                          signOut({
                            redirect: true,
                            callbackUrl: '/',
                          });
                          closeDropdown();
                          closeMenu();
                        }}
                        className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all w-full text-center"
                      >
                        Se déconnecter
                      </button>
                    ) : (
                      <Link
                        href="/sign-in"
                        onClick={() => {
                          closeDropdown();
                          closeMenu();
                        }}
                        className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all"
                      >
                        Se connecter
                      </Link>
                    )}
                  </li>

                  {isAdmin && (
                    <li className="hover:bg-green hover:text-white">
                      <Link
                        href="/admin"
                        onClick={() => {
                          closeDropdown();
                          closeMenu();
                        }}
                        className="block border-2 border-green text-green px-4 py-2 rounded-md hover:text-white transition-all"
                      >
                        Mon dashboard
                      </Link>
                    </li>
                  )}

                  {isAuthenticated && (
                    <li className="hover:bg-green hover:text-white">
                      <Link
                        href="/profile"
                        onClick={() => {
                          closeDropdown();
                          closeMenu();
                        }}
                        className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-all"
                      >
                        Mon profil & réservations
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            className="text-lg font-bold bg-white text-green rounded-sm px-4 py-2"
            aria-label="Réserver maintenant"
          >
            <Link
              href="/reservation"
              className="block w-full h-full text-center"
              onClick={() => {
                closeDropdown();
                closeMenu();
              }}
            >
              Réserver maintenant
            </Link>
          </button>
        </div>
      </nav>

      <div className="absolute bottom-0 w-full h-[4px] md:h-[6px] gradient-gold z-0"></div>
    </header>
  );
};

export default Header;