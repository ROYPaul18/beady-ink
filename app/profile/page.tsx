import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileEditor from "../ui/profile/ProfileEditor";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Vérifier si la session ou session.user est présent
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  // Récupérer les informations utilisateur de la base de données
  const userProfile = await db.user.findUnique({
    where: { email: user.email ?? "" },
    include: { reservations: true },
  });

  return (
    <div className="container mx-auto p-8">
      <ProfileEditor userProfile={userProfile} />
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Mes Réservations</h2>
        <ul>
          {userProfile?.reservations.map((reservation) => (
            <li key={reservation.id} className="border p-4 my-2 rounded">
              <p><strong>Date :</strong> {reservation.date.toLocaleString()}</p>
              <p><strong>Salon :</strong> {reservation.salon}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
