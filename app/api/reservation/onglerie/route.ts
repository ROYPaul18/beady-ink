import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dates = searchParams.get("dates")?.split(",");
    const salon = searchParams.get("salon");

    if (!dates || !salon) {
      return NextResponse.json(
        { success: false, message: "Dates et salon requis" },
        { status: 400 }
      );
    }

    const reservations = await db.reservation.findMany({
      where: {
        salon: salon,
        date: {
          in: dates.map(date => new Date(date)),
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        date: true,
        time: true,
        prestations: {
          select: {
            duration: true,
          }
        }
      }
    });

    const formattedReservations = reservations.map(reservation => ({
      date: reservation.date.toISOString().split('T')[0],
      startTime: `${reservation.date.getHours().toString().padStart(2, '0')}:${reservation.date.getMinutes().toString().padStart(2, '0')}`,
      duration: parseInt(reservation.time),
    }));

    return NextResponse.json({
      success: true,
      reservations: formattedReservations
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}