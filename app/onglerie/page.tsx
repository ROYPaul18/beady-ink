// app/reservation/onglerie/page.tsx
import { db } from '@/lib/db';
import PrestationList from '@/app/ui/onglerie/PrestationList';
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

  const isAuthenticated = !!session;

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-4">

      <PrestationList prestations={prestations} isAuthenticated={isAuthenticated} />
    </div>
  );
}
