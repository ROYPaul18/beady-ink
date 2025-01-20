import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, addMinutes, startOfMinute } from "date-fns";
import { format, formatInTimeZone } from "date-fns-tz";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dates = searchParams.get("dates")?.split(",");
    const salon = searchParams.get("salon");
    const timeZone = "Europe/Paris";

    if (!dates || !salon) {
      return NextResponse.json(
        { success: false, message: "Dates et salon requis" },
        { status: 400 }
      );
    }

    console.log("Dates recherchées:", dates);

    // Ajuster les dates pour la requête
    const dateConditions = dates.map((date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      console.log(`Date ${date} - Début:`, dayStart, "Fin:", dayEnd);
      
      return {
        AND: [
          { date: { gte: dayStart } },
          { date: { lt: dayEnd } },
        ],
      };
    });

    const reservations = await db.reservation.findMany({
      where: {
        salon: salon,
        OR: dateConditions,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        date: true,
        prestations: {
          select: {
            duration: true,
          },
        },
      },
    });

    console.log("Réservations brutes:", JSON.stringify(reservations, null, 2));

    const formattedReservations = reservations
      .map((reservation) => {
        if (!reservation.prestations || reservation.prestations.length === 0) {
          console.error("Prestation manquante pour la réservation:", reservation);
          return null;
        }

        const date = reservation.date;
        console.log("Date originale:", date);
        console.log("Date originale ISO:", date.toISOString());

        // Récupérer uniquement l'heure brute (format HH:mm)
        const startTime = date.toISOString().split("T")[1].split(".")[0];  // Exemple: "13:30:00"

        // Calculer la durée totale
        const totalDuration = reservation.prestations.reduce(
          (sum, prestation) => sum + prestation.duration,
          0
        );

        // Calculer l'heure de fin en ajoutant la durée
        const endTime = addMinutes(date, totalDuration);
        const endFormattedTime = endTime.toISOString().split("T")[1].split(".")[0]; // Exemple: "14:30:00"

        const formattedReservation = {
          date: date.toISOString().split("T")[0], // Extrait la date sans l'heure
          startTime: startTime,
          endTime: endFormattedTime,
          duration: totalDuration,
        };

        console.log("Réservation formatée:", formattedReservation);
        
        return formattedReservation;
      })
      .filter(Boolean);

    console.log("Toutes les réservations formatées:", 
      JSON.stringify(formattedReservations, null, 2));

    return NextResponse.json({
      success: true,
      reservations: formattedReservations,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
