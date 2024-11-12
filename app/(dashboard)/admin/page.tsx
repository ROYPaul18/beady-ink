// app/(dashboard)/admin/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminDashboard from "../../ui/admin/AdminDashboard";
import { initializeHours } from "@/lib/initializeHours";
import { TattooRequestWithUser } from "@/lib/types";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  } else if ((session.user as { role: string }).role !== "ADMIN") {
    redirect("/");
  }

  const [rawPrestations, rawReservations, flavignyHours, soyeHours, rawTattooRequests] =
    await Promise.all([
      db.prestation.findMany({
        include: {
          images: true,
          service: true,
        },
      }),
      db.reservation.findMany({
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
      }),
      initializeHours("Flavigny"),
      initializeHours("Soye-en-Septaine"),
      db.tattooRequest.findMany({
        include: {
          user: true,
        },
      }),
    ]);

  const rawOpeningHours = [...flavignyHours, ...soyeHours];

  const prestations = rawPrestations.map((prestation) => ({
    ...prestation,
    category: prestation.category ?? null,
  }));

  const reservations = rawReservations.map((reservation) => ({
    ...reservation,
    prestations: reservation.prestations.map((prestation) => ({
      ...prestation,
      category: prestation.category ?? null,
    })),
  }));

  const openingHours = rawOpeningHours.map((hour) => ({
    ...hour,
    salon: hour.salon ?? "",
    jour: hour.jour ?? "",
    startTime: hour.startTime,
    endTime: hour.endTime,
  }));

  const tattooRequests: TattooRequestWithUser[] = rawTattooRequests.map((request) => ({
    id: request.id,
    availability: request.availability,
    size: request.size,
    placement: request.placement,
    referenceImages: request.referenceImages ?? [],
    healthData:
      typeof request.healthData === 'object' && request.healthData !== null
        ? (request.healthData as { [key: string]: string })
        : {},
    user: {
      nom: request.user?.nom ?? 'Nom inconnu',
      prenom: request.user?.prenom ?? '',
      phone: request.user?.telephone ?? 'Non fourni', // Assurez-vous d'utiliser 'phone' et de fournir une valeur par défaut
    },
  }));

  return (
    <div className="bg-[url('/img/bg-marbre.png')] w-full">
      <h1 className="text-4xl md:text-6xl text-green-600 text-center font-bold mb-8 text-green">
        Tableau de bord
      </h1>
      <AdminDashboard
        prestations={prestations}
        reservations={reservations}
        openingHours={openingHours}
        tattooRequests={tattooRequests}
      />
    </div>
  );
}
