'use client';

import { useState } from 'react';
import PrestationList from './PrestationList';
import { Prestation } from '@/lib/types';

// Composant pour afficher la galerie de tatouages avec gestion de la pagination
const TatouageGallery: React.FC<{ prestations: Prestation[] }> = ({ prestations }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Nombre d'images visibles par défaut

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 5); // Afficher 5 images de plus à chaque clic
  };

  return (
    <section className="">
      <div className="max-w-7xl mx-auto px-4">

        {/* Afficher les prestations avec le composant PrestationList */}
        <PrestationList prestations={prestations.slice(0, visibleCount)} />

        {/* Bouton "Voir Plus" */}
        {visibleCount < prestations.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSeeMore}
              className="bg-marron text-white px-6 py-2 rounded-sm hover:bg-red-700 transition duration-200"
            >
              Voir Plus
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TatouageGallery;
