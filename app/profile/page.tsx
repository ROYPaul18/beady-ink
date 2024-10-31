// ProfilePage.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileEditor from "../ui/profile/ProfileEditor";
import ReservationList from "../ui/profile/ReservationList";
import { redirect } from "next/navigation";
import ReviewForm from "../ui/profile/ReviewForm"; // Import du composant ReviewForm

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
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen p-8 flex justify-center flex-col md:flex-row gap-8">
      <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/2 h-full">
        <ProfileEditor userProfile={userProfile} />
      </div>
      <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/2 h-full flex justify-center">
        <ReservationList reservations={reservations} />
      </div>
    </div>
  );
}
