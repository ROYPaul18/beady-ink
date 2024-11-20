import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatTime, closeOtherSalonForWeek } from '@/lib/opening-hours-utils';
import { startOfDay, endOfDay } from "date-fns";
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

    const effectiveStartTime = isClosed ? "" : formatTime(startTime || "09:00");
    const effectiveEndTime = isClosed ? "" : formatTime(endTime || "19:00");

    // Ferme l'autre salon pour la même semaine si ce salon est ouvert
    if (!isClosed) {
      await closeOtherSalonForWeek(salon, date);
    }

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
        { message: "Le salon, jour, date, et isClosed sont requis." },
        { status: 400 }
      );
    }

    if (id) {
      const updatedRecord = await db.openingHours.update({
        where: { id },
        data: {
          isClosed,
          startTime: isClosed ? '' : startTime,
          endTime: isClosed ? '' : endTime,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedRecord,
      });
    } else {
      const existingRecord = await db.openingHours.findFirst({
        where: { salon, date: new Date(date) },
      });

      if (existingRecord) {
        const updatedRecord = await db.openingHours.update({
          where: { id: existingRecord.id },
          data: {
            isClosed,
            startTime: isClosed ? '' : startTime,
            endTime: isClosed ? '' : endTime,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          data: updatedRecord,
        });
      } else {
        const newRecord = await db.openingHours.create({
          data: {
            salon,
            jour,
            startTime: isClosed ? '' : startTime,
            endTime: isClosed ? '' : endTime,
            isClosed,
            date: new Date(date),
          },
        });

        return NextResponse.json({
          success: true,
          data: newRecord,
        });
      }
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour des horaires", success: false },
      { status: 500 }
    );
  }
}


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

    console.log("Récupération des horaires pour :", { salon, dates });

    const openingHoursData: {
      [key: string]: {
        id: number | null;
        isClosed: boolean;
        startTime: string;
        endTime: string;
      };
    } = {};

    for (const date of dates) {
      const startDate = startOfDay(new Date(date));
      const endDate = endOfDay(new Date(date));

      console.log(`Recherche pour ${salon} entre ${startDate} et ${endDate}`);

      // Recherche des horaires dans la base pour chaque date
      let openingHour = await db.openingHours.findFirst({
        where: {
          salon,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (!openingHour) {
        console.log(`Aucune entrée trouvée pour ${salon} à la date ${date}. Création d'une entrée par défaut.`);

        const isSunday = new Date(date).getDay() === 0;
        const isClosed = salon === "Flavigny" || isSunday;

        // Crée une nouvelle entrée dans la base si aucune n'existe
        openingHour = await db.openingHours.create({
          data: {
            salon,
            jour: format(new Date(date), "eeee", { locale: fr }).toLowerCase(),
            date: startDate,
            isClosed,
            startTime: isClosed ? "" : "09:00",
            endTime: isClosed ? "" : "19:00",
          },
        });
      }

      // Ajouter les données au résultat
      openingHoursData[date] = {
        id: openingHour.id,
        isClosed: openingHour.isClosed,
        startTime: openingHour.startTime || "09:00",
        endTime: openingHour.endTime || "19:00",
      };
    }

    console.log("Horaires retournés :", openingHoursData);
    return NextResponse.json(openingHoursData);
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}




