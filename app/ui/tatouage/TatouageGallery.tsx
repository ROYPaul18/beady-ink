"use client";

import { useState } from "react";
import PrestationList from "./PrestationList";
import { Prestation } from "@/lib/types";

// Composant pour afficher la galerie de tatouages avec gestion de la pagination
const TatouageGallery: React.FC<{ prestations: Prestation[] }> = ({ prestations }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Nombre d'images visibles par défaut

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 5); // Afficher 5 images de plus à chaque clic
  };

  return (
    <>
      {/* Afficher les prestations avec le composant PrestationList */}
      <PrestationList prestations={prestations.slice(0, visibleCount)} />

      {/* Bouton "Voir Plus" */}
      {visibleCount < prestations.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSeeMore}
            className="bg-dark-red text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
            Voir Plus
          </button>
        </div>
      )}
    </>
  );
};

export default TatouageGallery;
