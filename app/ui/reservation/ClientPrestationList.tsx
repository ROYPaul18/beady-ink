// app/reservation/onglerie/page.tsx
import { db } from '@/lib/db';
import ReservationPrestationList from '@/app/ui/reservation/ReservationPrestationList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServiceType } from '@prisma/client';

async function getOngleriePrestations() {
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
  });
}

export default async function OnglerieReservationPage() {
  const session = await getServerSession(authOptions);
  const prestations = await getOngleriePrestations();

  // Vérifie si l'utilisateur est authentifié
  const isAuthenticated = !!session;

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-10">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
        Choisissez votre prestation d'onglerie
      </h1>

      {/* Afficher la liste des prestations avec le composant adapté */}
      <ReservationPrestationList prestations={prestations} isAuthenticated={isAuthenticated} />
    </div>
  );
}
