import { db } from "@/lib/db";
import PrestationList from "../ui/onglerie/PrestationList";

// Fonction pour récupérer les prestations depuis la base de données
async function getPrestations() {
  return db.prestation.findMany({
    include: {
      images: true, // Inclure les images associées aux prestations
      service: true, // Inclure le service associé pour afficher son type si nécessaire
    },
  });
}

export default async function PrestationsPage() {
  const prestations = await getPrestations();

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-8 py-2 md:px-26 lg:px-40">
      <h1 className="text-green text-center text-4xl md:text-6xl mb-2">
        Nos Prestations
      </h1>
      <PrestationList prestations={prestations} />
    </div>
  );
}
