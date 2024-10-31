// app/(dashboard)/admin/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminDashboard from "../../ui/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  } else if ((session.user as { role: string }).role !== "ADMIN") {
    redirect("/");
  }

  const prestations = await db.prestation.findMany({
    include: {
      images: true,
      service: true,
    },
  });

  const reservations = await db.reservation.findMany({
    include: {
      user: true,
      service: true,
      prestations: {
        include: {
          images: true,
          service: true, // Ajout pour inclure `service` dans chaque prestation
        },
      },
    },
  });

  return (
    <div className=" bg-[url('/img/bg-marbre.png')] w-full ">
      <h1 className="text-4xl md:text-6xl text-green-600 text-center font-bold mb-8">
        Tableau de bord
      </h1>
      <AdminDashboard prestations={prestations} reservations={reservations} />
    </div>
  );
}
