import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prestation } from "@prisma/client";
import { db } from "@/lib/db";
import AddPrestationModal from "@/app/ui/admin/AddPrestationModal";
import AddServiceModal from "@/app/ui/admin/AddServiceModal";

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-4xl md:text-6xl text-green-600 text-center font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="max-w-5xl mx-auto">
        {/* Section des Modales */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 justify-center mb-8">
          <AddServiceModal />
          <AddPrestationModal />
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          Liste des prestations pour l'onglerie
        </h2>

        {/* Liste des prestations */}
        {prestations.length > 0 ? (
          <div className="bg-white shadow rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              {prestations.map((prestation) => (
                <li key={prestation.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">{prestation.name}</p>
                    <p className="text-sm text-gray-500">
                      Prix: {prestation.price} € | Durée: {prestation.duration} minutes
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600 text-center">Aucune prestation trouvée pour le service d'onglerie.</p>
        )}
      </div>
      <h2 className="mx-auto text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          Gallerie Tatouage
      </h2>

      <h2 className="mx-auto text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          Gallerie Flash tattoo
      </h2>
    </div>
  );
}
