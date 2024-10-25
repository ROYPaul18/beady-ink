import { db } from '@/lib/db';
import dynamic from 'next/dynamic'; // Import dynamique pour le composant
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServiceType } from '@prisma/client';
import { PrestationWithImages } from '@/lib/types';

// Charger le composant ClientOnglerieReservation dynamiquement
const ClientOnglerieReservation = dynamic(() => import('@/app/ui/reservation/ClientOnglerieReservation'), { ssr: false });

async function getOngleriePrestations(): Promise<PrestationWithImages[]> {
  return db.prestation.findMany({
    where: {
      service: {
        type: ServiceType.ONGLERIE,
      },
    },
    include: {
      images: true,
      service: true,
    },
    take: 10, // Limitez le nombre de résultats pour éviter de surcharger
  });
}

export default async function OnglerieReservationPage() {
  const session = await getServerSession(authOptions);
  const prestations = await getOngleriePrestations();
  const isAuthenticated = !!session;

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-10">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
        Choisissez votre prestation d'onglerie
      </h1>

      <ClientOnglerieReservation
        prestations={prestations}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
