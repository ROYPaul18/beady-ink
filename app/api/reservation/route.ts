import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const user = session.user;
  const { date, time, salon, serviceId, prestationIds } = await req.json();

  if (!serviceId || !prestationIds || !prestationIds.length) {
    return NextResponse.json({ message: "Le service et au moins une prestation sont requis" }, { status: 400 });
  }

  const formattedTime = time.includes("h")
    ? time.replace("h", ":").padStart(5, "0")
    : time;

  const reservationDateString = `${date.split("T")[0]}T${formattedTime}:00`;
  const reservationDate = new Date(reservationDateString);

  if (isNaN(reservationDate.getTime())) {
    return NextResponse.json({ message: "La date ou l'heure est invalide" }, { status: 400 });
  }

  try {
    const reservation = await db.reservation.create({
      data: {
        date: reservationDate,
        salon: salon || "Inconnu",
        user: { connect: { email: user.email ?? "" } },
        service: { connect: { id: serviceId } },
        prestations: { connect: prestationIds.map((id: number) => ({ id })) }, // Associer les prestations à la réservation
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Erreur de réservation :", error);
    return NextResponse.json({ message: "Erreur lors de la réservation" }, { status: 500 });
  }
}
