import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileEditor from "../ui/profile/ProfileEditor";
import ReservationList from "../ui/profile/ReservationList";
import { redirect } from "next/navigation";
import Image from 'next/image';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  const userProfile = await db.user.findUnique({
    where: { email: user.email ?? "" },
    include: {
      reservations: {
        include: {
          user: true,
          service: true,
          prestations: {
            include: {
              images: true,
              service: true,
            },
          },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  const reservations = userProfile?.reservations || [];

  return (
    <div className="relative min-h-screen p-8 flex flex-col md:flex-row-reverse gap-8">
      {/* Image de fond optimisée */}
      <Image
        src="/img/bg-marbre.png"
        alt="Fond Profil"
        fill
        style={{ objectFit: "cover", zIndex: -1 }}
        priority
      />

      {/* Réservations */}
      <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/2 h-full">
        <ReservationList reservations={reservations} />
      </div>

      {/* Éditeur de profil */}
      <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/2 h-full">
        <ProfileEditor userProfile={userProfile} />
      </div>
    </div>
  );
}
