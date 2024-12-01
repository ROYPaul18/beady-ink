'use client'
import { useEffect, useState } from "react";
import { OnglerieCategory } from "@prisma/client";
import CategoryPage from "@/app/ui/onglerie/CategoryPage"; // Assurez-vous du bon chemin du fichier

interface Props {
  params: Promise<{
    category: OnglerieCategory; // Assuming the category is a string or enum
  }>;
}

const OnglerieCategoryPage = ({ params }: Props) => {
  const [prestations, setPrestations] = useState([]);
  const [category, setCategory] = useState<OnglerieCategory | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const resolvedParams = await params; // Wait for the params Promise to resolve
        if (resolvedParams.category) {
          setCategory(resolvedParams.category); // Set the category once resolved
        }
      } catch (error) {
        console.error("Error fetching params:", error);
      }
    };

    fetchParams();
  }, [params]); // This effect will run whenever params changes

  useEffect(() => {
    if (category) {
      const fetchPrestations = async () => {
        const res = await fetch(`/api/prestation?category=${category}`);
        const data = await res.json();
        setPrestations(data.prestations || []);
      };
      fetchPrestations();
    }
  }, [category]); // Re-fetch prestations whenever the category changes

  if (!category) {
    return <div>Chargement...</div>; // Show loading message until category is set
  }

  return (
    <CategoryPage
      initialCategory={category} // Pass the category directly
      initialPrestations={prestations}
    />
  );
};

export default OnglerieCategoryPage;
