// app/onglerie/page.tsx
import PrestationList from '@/app/ui/onglerie/PrestationList';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

async function fetchOngleriePrestations() {
  return await db.prestation.findMany({
    where: {
      service: {
        type: 'ONGLERIE',
      },
    },
    include: {
      images: true,
      service: true,
    },
  });
}

export default async function OngleriePage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session; // Vérifie si l'utilisateur est connecté

  const prestations = await fetchOngleriePrestations();

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-8 py-2 md:px-26 lg:px-60">
      <h1 className="text-green  text-center text-4xl md:text-6xl mb-10">
        Prestations d'Onglerie
      </h1>
      <PrestationList prestations={prestations} isAuthenticated={isAuthenticated} />
    </div>
  );
}
