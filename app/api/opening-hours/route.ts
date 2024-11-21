import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatTime, closeOtherSalonForWeek } from '@/lib/opening-hours-utils';
import { startOfDay, endOfDay, startOfWeek, addDays } from "date-fns";
import { format } from 'date-fns';
import { fr } from "date-fns/locale";

// POST : Crée un nouvel horaire pour un jour spécifique
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { salon, jour, startTime, endTime, isClosed, date } = data;

    if (!salon || !jour || !date) {
      return NextResponse.json(
        { message: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    // Vérifiez si un horaire existe déjà pour cette date
    const existingHour = await db.openingHours.findFirst({
      where: { salon, date: new Date(date) },
    });

    if (existingHour) {
      return NextResponse.json(
        { message: "Un horaire existe déjà pour cette date.", success: false },
        { status: 400 }
      );
    }

    const effectiveStartTime = isClosed ? "" : formatTime(startTime || "");
    const effectiveEndTime = isClosed ? "" : formatTime(endTime || "");

    const result = await db.openingHours.create({
      data: {
        salon,
        jour: jour.toLowerCase(),
        startTime: effectiveStartTime,
        endTime: effectiveEndTime,
        isClosed,
        date: new Date(date),
      },
    });

    return NextResponse.json({
      message: "Heures d'ouverture enregistrées avec succès",
      result,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des heures d'ouverture :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}



// PUT : Met à jour un horaire existant pour un jour spécifique
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, salon, jour, startTime, endTime, isClosed, date } = body;

    if (!salon || !jour || !date || isClosed === undefined) {
      return NextResponse.json(
        { message: "Le salon, jour, date, et isClosed sont requis.", success: false },
        { status: 400 }
      );
    }

    if (id) {
      // Mettre à jour l'enregistrement existant
      const updatedRecord = await db.openingHours.update({
        where: { id },
        data: {
          isClosed,
          startTime: isClosed ? "" : startTime,
          endTime: isClosed ? "" : endTime,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedRecord,
      });
    } else {
      // Créer une nouvelle entrée si aucune n'existe
      const newRecord = await db.openingHours.create({
        data: {
          salon,
          jour,
          startTime: isClosed ? "" : startTime,
          endTime: isClosed ? "" : endTime,
          isClosed,
          date: new Date(date),
        },
      });

      return NextResponse.json({
        success: true,
        data: newRecord,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des horaires :", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour des horaires", success: false },
      { status: 500 }
    );
  }
}

// GET : Récupère les heures d'ouverture pour des jours spécifiques
// GET : Récupère les heures d'ouverture pour des jours spécifiques
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salon = searchParams.get("salon");
    const datesParam = searchParams.get("dates");

    if (!salon || !datesParam) {
      return NextResponse.json(
        { message: "Le salon et les dates sont requis.", success: false },
        { status: 400 }
      );
    }

    const dates = datesParam.split(",");
    console.log("Dates demandées:", dates);
    
    const currentWeekStart = startOfWeek(new Date(dates[0]), { weekStartsOn: 1 });

    // Ne récupère que les horaires qui existent réellement dans la base
    const salonHours = await db.openingHours.findMany({
      where: {
        salon,
        date: {
          gte: currentWeekStart,
          lt: addDays(currentWeekStart, 7)
        }
      },
    });

    console.log("Horaires trouvés pour le salon:", salonHours);

    const openingHoursData: {
      [key: string]: {
        id: number | null;
        isClosed: boolean;
        startTime: string;
        endTime: string;
      };
    } = {};

    // Pour chaque date demandée
    for (const date of dates) {
      const currentDate = new Date(date);
      const isSunday = currentDate.getDay() === 0;

      // Si c'est un dimanche, ne pas inclure d'horaires du tout
      if (isSunday) {
        continue;
      }

      // Pour les autres jours, chercher les horaires existants
      const dayHours = salonHours.find(
        h => format(h.date, 'yyyy-MM-dd') === date
      );

      // Ne retourner des horaires que s'ils existent réellement dans la base
      if (dayHours) {
        openingHoursData[date] = {
          id: dayHours.id,
          isClosed: dayHours.isClosed,
          startTime: dayHours.startTime || "",
          endTime: dayHours.endTime || "",
        };
      }
      // Si pas d'horaires trouvés, ne rien ajouter à openingHoursData
    }

    console.log("Horaires envoyés:", openingHoursData);
    return NextResponse.json(openingHoursData);

  } catch (error) {
    console.error("Erreur lors de la récupération des horaires :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}





