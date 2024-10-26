import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Rediriger si l'utilisateur n'est pas connecté
  if (!session) {
    redirect("/sign-in");
  }

  const user = session?.user;

  // Récupérer des informations supplémentaires si besoin depuis la base de données (ex: numéro de téléphone, etc.)
  const userProfile = await db.user.findUnique({
    where: { email: user?.email || "" },
  });

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Profil */}
        <div className="bg-gray-100 p-6 rounded-md">
          <h2 className="text-3xl font-semibold mb-6 text-center">Éditer mon profil</h2>
          <ul className="space-y-4">
            <li className="flex items-center bg-gray-200 p-4 rounded-md">
              <span className="mr-4 text-xl">
                <i className="fas fa-user"></i> {/* Icône utilisateur */}
              </span>
              <span>{userProfile?.prenom?.split(' ')[0] || 'Prénom'}</span>
            </li>
            <li className="flex items-center bg-gray-200 p-4 rounded-md">
              <span className="mr-4 text-xl">
                <i className="fas fa-user"></i> {/* Icône utilisateur */}
              </span>
              <span>{userProfile?.nom?.split(' ')[1] || 'Nom'}</span>
            </li>
            <li className="flex items-center bg-gray-200 p-4 rounded-md">
              <span className="mr-4 text-xl">
                <i className="fas fa-envelope"></i> {/* Icône email */}
              </span>
              <span>{userProfile?.email || 'Email'}</span>
            </li>
            <li className="flex items-center bg-gray-200 p-4 rounded-md">
              <span className="mr-4 text-xl">
                <i className="fas fa-phone"></i>
              </span>
              <span>{userProfile?.telephone || 'Téléphone non défini'}</span>
            </li>
          </ul>
          <div className="mt-6">
            <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Espace réservé avec bordure */}
        <div className="border-l-2 border-gray-300"></div>
      </div>
    </div>
  );
}
