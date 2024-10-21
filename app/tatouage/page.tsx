import { db } from "@/lib/db";
import PrestationList from "../ui/tatouage/PrestationList";
import { Prestation } from "@/lib/types";
import TatouageGallery from "../ui/tatouage/TatouageGallery";

// Fonction pour récupérer les prestations de tatouage
async function getTatouages(): Promise<Prestation[]> {
  return db.prestation.findMany({
    where: {
      service: {
        type: "TATOUAGE",
      },
    },
    include: {
      images: true,
    },
  });
}

// Composant pour la page des tatouages
export default async function TatouagePage() {
  const tatouages = await getTatouages();

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover px-8 py-2 md:px-26 lg:px-60">
      <h1 className="text-white text-center text-4xl md:text-6xl mb-10">
        Nos Prestations
      </h1>
      <div className="flex justify-end mb-6">
        <a
          href="/reservation/tatouage"
          className="bg-marron text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Se Faire Tatouer
        </a>
      </div>

      <TatouageGallery prestations={tatouages} />
    </div>
  );
}
