import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const user = session.user;
    const { date, time, startTime, salon, serviceId, prestationIds } = await req.json();

    if (!serviceId || !prestationIds || !prestationIds.length) {
      return NextResponse.json(
        { message: "Le service et au moins une prestation sont requis" }, 
        { status: 400 }
      );
    }

    // Récupérer les prestations pour vérifier la durée
    const prestations = await db.prestation.findMany({
      where: {
        id: {
          in: prestationIds,
        },
      },
    });

    // Calculer la durée totale
    const totalDuration = prestations.reduce((acc, prestation) => acc + prestation.duration, 0);

    // Vérifier que la durée correspond
    if (totalDuration.toString() !== time) {
      return NextResponse.json(
        { message: "La durée ne correspond pas aux prestations sélectionnées" },
        { status: 400 }
      );
    }

    // Formater l'heure de début
    const formattedStartTime = startTime.includes("h")
      ? startTime.replace("h", ":").padStart(5, "0")
      : startTime;

    const reservationDate = new Date(`${date.split("T")[0]}T${formattedStartTime}:00.000Z`);

    // Vérifier les conflits de réservation
    const existingReservations = await db.reservation.findMany({
      where: {
        salon,
        date: reservationDate,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
    });

    if (existingReservations.length > 0) {
      return NextResponse.json(
        { message: "Ce créneau n'est plus disponible" },
        { status: 400 }
      );
    }

    // Créer la réservation
    const reservation = await db.reservation.create({
      data: {
        date: reservationDate,
        time: totalDuration.toString(), // Stocker la durée dans le champ time
        salon: salon,
        status: "PENDING",
        user: {
          connect: {
            email: user.email ?? "",
          },
        },
        service: {
          connect: {
            id: serviceId,
          },
        },
        prestations: {
          connect: prestationIds.map((id: number) => ({ id })),
        },
      },
      include: {
        prestations: true,
        service: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Réservation créée avec succès",
      reservation: {
        ...reservation,
        startTime: formattedStartTime,
        duration: totalDuration
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur de réservation:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Erreur lors de la création de la réservation",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 