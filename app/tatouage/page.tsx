export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import TatouageGallery from "../ui/tatouage/TatouageGallery";
import { Prestation } from "@/lib/types";
import Image from 'next/image';

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
      service: true,
    },
  });
}

// Composant pour la page des tatouages
export default async function TatouagePage() {
  const tatouages = await getTatouages();

  return (
    <div className="relative min-h-screen px-8 py-2 md:px-26 lg:px-60">
      {/* Image de fond optimisée */}
      <Image
        src="/img/13.png"
        alt="Fond Tatouage"
        fill
        style={{ objectFit: "cover", zIndex: -1 }}
        priority
      />

      <div className="flex justify-end">
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

export async function generateStaticParams() {
  const tatouages = await getTatouages();
  return tatouages.map(tatouage => ({
    params: { id: tatouage.id.toString() },
  }));
}
