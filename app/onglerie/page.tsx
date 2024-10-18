import { db } from "@/lib/db"; // Importer Prisma
import PrestationList from "../ui/onglerie/PrestationList";

// Fonction pour récupérer les prestations depuis la base de données
async function getPrestations() {
  return db.prestation.findMany({
    include: {
      images: true, // Inclure les images associées aux prestations
    },
  });
}

export default async function PrestationsPage() {
  // Récupérer les prestations depuis la base de données
  const prestations = await getPrestations();

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-8 py-2 md:px-26 lg:px-60">
      <h1 className="text-green text-center text-4xl md:text-6xl  mb-10">
        Nos Prestations
      </h1>

      {/* Utiliser le composant PrestationList et passer les prestations */}
      <PrestationList prestations={prestations} />
    </div>
  );
}
