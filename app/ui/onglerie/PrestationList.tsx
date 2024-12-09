'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrestationWithImages } from "@/lib/types";
import Image from "next/image";

const formatCategoryName = (category: string) => {
  return category.toLowerCase().replace(/_/g, " ");
};

interface PrestationListProps {
  prestations: PrestationWithImages[];
  isAuthenticated: boolean;
}

const PrestationList: React.FC<PrestationListProps> = ({
  prestations,
  isAuthenticated,
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleReservationClick = (id: number) => {
    if (isAuthenticated) {
      router.push(`/reservation/onglerie/calendar?id=${id}`);
    } else {
      router.push("/sign-up");
    }
  };

  const prestationsByCategory = prestations.reduce((acc, prestation) => {
    const category = prestation.category || "Autres";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(prestation);
    return acc;
  }, {} as Record<string, PrestationWithImages[]>);

  const categories = Object.keys(prestationsByCategory);

  const displayedPrestations = selectedCategory
    ? prestationsByCategory[selectedCategory] || []
    : prestations;

  return (
    <div className="min-h-screen bg-cover px-4 sm:px-6 md:px-10 lg:px-20">
      {/* Titre */}
      <h1 className="text-center text-green text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
        {selectedCategory
          ? formatCategoryName(selectedCategory)
          : "Choisissez une catégorie"}
      </h1>

      {/* Boutons de catégories */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto mb-8">
          {categories.map((category) => (
            <div
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="group relative gradient-gold-border overflow-hidden cursor-pointer"
            >
              <div className="relative h-64 md:h-80 w-full">
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-60">
                  <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold flex items-center justify-center">
                    {formatCategoryName(category)}
                  </h2>
                </div>
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url('/img/bg-feuille.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flèche de retour */}
      {selectedCategory && (
        <div className="mb-6 flex items-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-white bg-green px-4 py-2 rounded shadow-md hover:bg-green-300 transition"
          >
            <span className="text-xl">&larr;</span>
            <span className="text-base sm:text-lg font-medium">Retour</span>
          </button>
        </div>
      )}

      {/* Prestations affichées */}
      {selectedCategory && (
        <div className="px-4 sm:px-6 md:px-10 lg:px-20">
          {displayedPrestations.length > 0 ? (
            displayedPrestations.map((prestation) => (
              <div
                key={prestation.id}
                className="bg-white shadow-lg overflow-hidden mb-6 rounded-lg"
              >
                {/* Image en haut pour mobile */}
                <div className="w-full relative h-[200px] sm:h-[250px] md:hidden">
                  {prestation.images[0] && (
                    <Image
                      src={prestation.images[0].url}
                      alt={`Image de ${prestation.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw"
                      priority
                    />
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:h-[500px]">
                  {/* Contenu */}
                  <div className="w-full p-4 sm:p-6 flex flex-col justify-between md:w-1/2">
                    <div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green mb-2 sm:mb-4">
                        {prestation.name}
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                        {prestation.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-green">
                        <span className="text-sm sm:text-base md:text-lg">
                          Durée : {prestation.duration} min
                        </span>
                        <span className="text-sm sm:text-base md:text-lg">
                          Prix : {prestation.price} €
                        </span>
                      </div>
                      <button
                        onClick={() => handleReservationClick(prestation.id)}
                        className="w-full sm:w-auto border border-green text-green px-3 py-2 rounded-sm text-sm sm:text-base md:text-lg hover:bg-green hover:text-white transition duration-200 mt-4"
                      >
                        RÉSERVER CETTE PRESTATION
                      </button>
                    </div>
                  </div>

                  {/* Image à droite pour desktop */}
                  <div className="hidden md:block w-full md:w-1/2 relative">
                    {prestation.images[0] && (
                      <Image
                        src={prestation.images[0].url}
                        alt={`Image de ${prestation.name}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 50vw"
                        priority
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm sm:text-base px-4">
              Aucune prestation trouvée pour cette catégorie.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrestationList;
