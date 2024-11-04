import PrestationList from '@/app/ui/onglerie/PrestationList';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';

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
  const isAuthenticated = !!session; 

  const prestations = await fetchOngleriePrestations();

  return (
    <div className="relative min-h-screen px-8 py-2 md:px-26 lg:px-60">
      {/* Image de fond optimisée */}
      <Image
        src="/img/bg-marbre.png"
        alt="Fond Onglerie"
        fill
        style={{ objectFit: "cover", zIndex: -1 }}
        priority
      />

      <PrestationList prestations={prestations} isAuthenticated={isAuthenticated} />
    </div>
  );
}
