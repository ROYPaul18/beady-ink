'use client';
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className={`relative bg-[url('/img/bg-feuille.jpg')] bg-cover bg-center ${menuOpen ? "h-screen" : "h-auto"}`}>
      <div className="flex justify-between items-center p-4 relative z-50">
        <h1 className="text-3xl lg:text-6xl font-bold md:text-center md:flex-grow">
          Beaudy Ink
        </h1>
        <button
          className="block lg:hidden text-3xl focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu pour les petites résolutions */}
      <nav
        className={`${
          menuOpen 
            ? "fixed top-0 left-0 w-full h-screen z-40 flex flex-col items-center justify-center bg-[url('/img/bg-feuille.jpg')] bg-cover bg-center pt-20"
            : "hidden"
        } lg:flex lg:relative lg:justify-center lg:items-center p-4 lg:p-0 lg:pt-0`}
      >
        <div className="flex flex-col items-center lg:flex-row lg:gap-4 lg:justify-center lg:w-full lg:ml-20 lg:mr-20">
          <h1 className="text-2xl p-4 text-center">
            <Link href="/" onClick={closeMenu}>Accueil</Link>
          </h1>
          <h1 className="text-2xl p-4 text-center">
            <Link href="/onglerie" onClick={closeMenu}>Onglerie</Link>
          </h1>
          <h1 className="text-2xl p-4 text-center">
            <Link href="/tatouage" onClick={closeMenu}>Tatouage</Link>
          </h1>
          <h1 className="text-2xl p-4 text-center">
            <Link href="/tattoo" onClick={closeMenu}>Flash Tattoo</Link>
          </h1>
        </div>

        {/* Icône utilisateur + Bouton "Reserver maintenant" alignés à droite pour grand écran */}
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-4 lg:absolute lg:right-4 relative">
          <div className="relative">
            <button onClick={toggleDropdown}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50 w-48">
                <ul className="flex flex-col text-center space-y-4">
                  <li>
                    <Link href="/signup" onClick={closeDropdown} className="block bg-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all">
                      Se créer un compte
                    </Link>
                  </li>

                  {/* Se connecter - Bouton avec style de contour */}
                  <li>
                    <Link href="/login" onClick={closeDropdown} className="block border-2 border-green text-green px-4 py-2 rounded-md hover:bg-green-600 hover:text-green transition-all">
                      Se connecter
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button className="text-lg font-bold bg-white text-green rounded-sm px-4 py-1">
            Reserver maintenant
          </button>
        </div>
      </nav>

      <div className="absolute bottom-0 w-full h-[4px] md:h-[6px] gradient-gold z-50"></div>
    </header>
  );
}
