import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prestation } from "@prisma/client";
import { db } from "@/lib/db";
import AddPrestationModal from "@/app/ui/admin/AddPrestationModal";
import AddServiceModal from "@/app/ui/admin/AddServiceModal";
import PrestationList from "@/app/ui/admin/PrestationList"; 

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  } else if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Récupérer les prestations depuis la base de données
  const prestations: Prestation[] = await db.prestation.findMany({
    where: { serviceId: 1 }, // Ajustez selon vos besoins
  });
  console.log('Prestations from database:', prestations);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-4xl md:text-6xl text-green-600 text-center font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 justify-center mb-8">
          <AddServiceModal />
          <AddPrestationModal />
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          Liste des prestations pour l'onglerie
        </h2>

        {/* Passe les prestations au composant client */}
        <PrestationList prestations={prestations} />

      </div>
    </div>
  );
}
