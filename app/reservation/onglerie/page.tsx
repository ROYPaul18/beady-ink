import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrestationWithImages } from '@/lib/types';
import { ServiceType } from "@prisma/client";
import ClientOnglerieReservation from '@/app/ui/reservation/ClientOnglerieReservation';

async function getOngleriePrestations(): Promise<PrestationWithImages[]> {
  return db.prestation.findMany({
    where: {
      service: {
        type: ServiceType.ONGLERIE,
      },
    },
    include: {
      images: true, // Si vous n'avez pas besoin de toutes les images, pensez à ajuster
      service: true,
    },
    take: 10, // Limite le nombre de résultats
  }) as Promise<PrestationWithImages[]>;
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
