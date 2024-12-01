import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { openingHourId, timeSlots } = body;

    if (!openingHourId || !timeSlots) {
      return NextResponse.json(
        { message: "L'ID de l'horaire et les plages horaires sont requis" },
        { status: 400 }
      );
    }

    // Supprimer les anciennes plages horaires
    await db.timeSlot.deleteMany({
      where: { openingHoursId: openingHourId }
    });

    // Créer les nouvelles plages horaires
    const createdTimeSlots = await Promise.all(
      timeSlots.map(async (slot: { startTime: string; endTime: string }) => {
        return db.timeSlot.create({
          data: {
            openingHoursId: openingHourId,
            startTime: slot.startTime,
            endTime: slot.endTime
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: createdTimeSlots
    });

  } catch (error) {
    console.error("Erreur lors de la gestion des plages horaires:", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const openingHourId = searchParams.get("openingHourId");

    if (!openingHourId) {
      return NextResponse.json(
        { message: "L'ID de l'horaire est requis" },
        { status: 400 }
      );
    }

    const timeSlots = await db.timeSlot.findMany({
      where: { openingHoursId: parseInt(openingHourId) },
      orderBy: { startTime: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: timeSlots
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des plages horaires:", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}