// AdminPage.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminDashboard from "../../ui//admin/AdminDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  } else if ((session.user as { role: string }).role !== "ADMIN") {
    redirect("/");
  }

  // Charger les prestations et les réservations
  const prestations = await db.prestation.findMany({
    include: {
      images: true,
      service: true,
    },
  });

  const reservations = await db.reservation.findMany({
    include: {
      user: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-4xl md:text-6xl text-green-600 text-center font-bold mb-8">
        Tableau de bord
      </h1>
      <AdminDashboard prestations={prestations} reservations={reservations} />
    </div>
  );
}
