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
  const { date, time, salon, serviceId } = await req.json();

  if (!serviceId) {
    return NextResponse.json({ message: "Le service est requis" }, { status: 400 });
  }

  if (!date || !time) {
    return NextResponse.json({ message: "La date et l'heure sont requises" }, { status: 400 });
  }

  // Conversion de `time` pour garantir un format `HH:MM`
  const formattedTime = time.includes("h")
    ? time.replace("h", ":").padStart(5, "0")
    : time;

  const reservationDateString = `${date.split("T")[0]}T${formattedTime}:00`;
  const reservationDate = new Date(reservationDateString);

  console.log("Date de réservation formatée :", reservationDate);

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
      },
    });
  
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erreur de réservation :", error.message);
      return NextResponse.json(
        { message: "Erreur lors de la réservation", details: error.message },
        { status: 500 }
      );
    } else {
      console.error("Erreur inconnue lors de la réservation :", error);
      return NextResponse.json(
        { message: "Erreur inconnue lors de la réservation" },
        { status: 500 }
      );
    }
  }
}
