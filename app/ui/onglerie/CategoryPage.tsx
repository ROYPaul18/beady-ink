'use client';

import { useState, useEffect } from "react";
import { PrestationWithImages } from "@/lib/types";
import ReservationPrestationList from "@/app/ui/reservation/ReservationPrestationList";
import OnglerieRecap from "@/app/ui/reservation/OnglerieRecap";
import ReservationActions from "@/app/ui/reservation/ReservationAction";
import { OnglerieCategory } from "@prisma/client";
import { useReservation } from "@/app/context/ReservationContext";

// Déclaration des props attendues par le composant
interface CategoryPageProps {
  initialCategory?: OnglerieCategory;
  initialPrestations?: PrestationWithImages[];
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  initialCategory = OnglerieCategory.SEMI_PERMANENT,
  initialPrestations = [],
}) => {
  const [category, setCategory] = useState<OnglerieCategory>(initialCategory);
  const [allPrestations, setAllPrestations] = useState<PrestationWithImages[]>(initialPrestations);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const { prestationsComplementaires, setPrestationsComplementaires } = useReservation();

  useEffect(() => {
    const loadAllPrestations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/prestation?serviceType=ONGLERIE`);
        const data = await res.json();
        setAllPrestations(data.prestations || []);
      } catch (error) {
        console.error("Erreur lors du chargement des prestations:", error);
      } finally {
        setIsLoading(false);
        setIsInitialLoadDone(true);
      }
    };

    if (initialPrestations.length === 0 && !isInitialLoadDone) {
      loadAllPrestations();
    }
  }, [initialPrestations, isInitialLoadDone]);

  const filteredPrestations = allPrestations.filter(
    (prestation) => prestation.category === category
  );

  const handleCategoryChange = (newCategory: OnglerieCategory) => {
    setCategory(newCategory);
  };

  const categoryCounts = Object.values(OnglerieCategory).reduce((acc, cat) => {
    acc[cat] = allPrestations.filter((prestation) => prestation.category === cat).length;
    return acc;
  }, {} as Record<OnglerieCategory, number>);

  const handleRemovePrestation = (id: number) => {
    setPrestationsComplementaires((prev) =>
      prev.filter((prestation) => prestation.id !== id)
    );
  };

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-[75vh] bg-cover px-4 pt-12 pb-28 flex flex-col md:flex-row gap-12">
      {/* Colonne latérale pour les catégories */}
      <div className="w-full md:w-1/4 bg-white shadow-lg rounded-lg p-6 max-h-full overflow-y-auto mb-6 md:mb-0">
        <h2 className="text-2xl font-bold text-green mb-4">Catégories</h2>
        <div className="flex flex-col space-y-2">
          {Object.values(OnglerieCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex justify-between items-center px-4 py-2 rounded-lg text-left ${
                cat === category ? "bg-green text-white" : "bg-gray-700 text-white"
              }`}
            >
              <span>{cat}</span>
              <span className="text-sm">({categoryCounts[cat] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section principale */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="text-center text-gray-500">Chargement des prestations...</div>
          ) : (
            <ReservationPrestationList prestations={filteredPrestations} isAuthenticated={true} />
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 max-h-full overflow-y-auto">
          <h2 className="text-2xl font-bold text-green mb-4">Récapitulatif</h2>
          <OnglerieRecap prestations={prestationsComplementaires} onRemovePrestation={handleRemovePrestation} />
          <ReservationActions />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
