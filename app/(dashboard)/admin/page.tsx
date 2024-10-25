// AdminPage.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AddPrestationModal from "@/app/ui/admin/AddPrestationModal";
import PrestationList from "@/app/ui/admin/PrestationList";
import { Prestation, Image as PrismaImage, Service } from "@prisma/client";
import { ServiceType } from "@prisma/client";

// Définir le type avec les images associées et le service
export interface PrestationWithImages extends Prestation {
  images: PrismaImage[];
  service: Service; // Inclure le service pour accéder à son type
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  } else if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Récupérer les prestations depuis la base de données avec les images associées et le service
  const prestations: PrestationWithImages[] = await db.prestation.findMany({
    include: {
      images: true, // Inclure les images dans les données récupérées
      service: true, // Inclure le service pour avoir accès au type
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-4xl md:text-6xl text-green-600 text-center font-bold mb-8">
        Tableau de bord
      </h1>

      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          Prestations Onglerie
        </h2>
        <AddPrestationModal serviceType={ServiceType.ONGLERIE} />
        <PrestationList
          prestations={prestations}
          serviceType={ServiceType.ONGLERIE}
        />

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
        Galerie Flash tattoo 
        </h2>
        <AddPrestationModal serviceType={ServiceType.FLASH_TATTOO} />
        <PrestationList
          prestations={prestations}
          serviceType={ServiceType.FLASH_TATTOO}
        />

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
          Galerie Tatouage
        </h2>
        <AddPrestationModal serviceType={ServiceType.TATOUAGE} />
        <PrestationList
          prestations={prestations}
          serviceType={ServiceType.TATOUAGE}
        />
      </div>
    </div>
  );
}
