import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatTime, closeOtherSalonForWeek } from '@/lib/opening-hours-utils';
import { startOfDay, endOfDay, startOfWeek, addDays } from "date-fns";
import { format } from 'date-fns';
import { fr } from "date-fns/locale";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface OpeningHoursData {
  [key: string]: {
    id: number | null;
    isClosed: boolean;
    startTime: string;
    endTime: string;
    timeSlots: TimeSlot[];
  };
}

function validateTime(time: string | undefined | null): string {
  if (!time) return "";
  try {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } catch {
    return "";
  }
}

// POST : Crée un nouvel horaire pour un jour spécifique
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { salon, jour, startTime, endTime, isClosed, date } = data;

    if (!salon || !jour || !date) {
      return NextResponse.json(
        { message: "Tous les champs sont obligatoires.", success: false },
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

    const effectiveStartTime = isClosed ? "" : validateTime(startTime);
    const effectiveEndTime = isClosed ? "" : validateTime(endTime);

    const result = await db.openingHours.create({
      data: {
        salon,
        jour: jour.toLowerCase(),
        startTime: effectiveStartTime,
        endTime: effectiveEndTime,
        isClosed,
        date: new Date(date),
        weekKey: format(startOfWeek(new Date(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      },
    });

    return NextResponse.json({
      message: "Heures d'ouverture enregistrées avec succès",
      success: true,
      result,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des heures d'ouverture :", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}
// PUT : Mise à jour des horaires d'ouverture avec les pauses
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, salon, jour, startTime, endTime, isClosed, date, timeSlots } = body;

    // Log les données reçues
    console.log("Données reçues dans PUT:", body);

    if (!salon || !jour || !date || isClosed === undefined) {
      return NextResponse.json(
        { message: "Le salon, jour, date, et isClosed sont requis.", success: false },
        { status: 400 }
      );
    }

    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const weekKey = format(startOfWeek(formattedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    // Log avant de commencer la transaction
    console.log(`Mise à jour des horaires pour le salon: ${salon}, jour: ${jour}, date: ${formattedDate}`);

    const result = await db.$transaction(async (prisma) => {
      // Mise à jour des horaires généraux
      const openingHours = await prisma.openingHours.upsert({
        where: {
          salon_date: {
            salon: salon,
            date: formattedDate,
          },
        },
        update: {
          jour: jour.toLowerCase(),
          isClosed: isClosed,
          startTime: isClosed ? "" : startTime,
          endTime: isClosed ? "" : endTime,
          updatedAt: new Date(),
        },
        create: {
          salon: salon,
          jour: jour.toLowerCase(),
          date: formattedDate,
          isClosed: isClosed,
          startTime: isClosed ? "" : startTime,
          endTime: isClosed ? "" : endTime,
        },
      });

      // Log après la mise à jour des horaires d'ouverture
      console.log("Horaires d'ouverture mis à jour :", openingHours);

      // Si le salon n'est pas fermé, mettez à jour les créneaux horaires
      if (!isClosed) {
        // Supprimer les anciens créneaux horaires
        console.log("Suppression des anciens créneaux horaires...");
        await prisma.timeSlot.deleteMany({
          where: { openingHoursId: openingHours.id },
        });

        // Ajouter de nouveaux créneaux horaires pour les pauses
        if (timeSlots) {
          console.log("Ajout des nouveaux créneaux horaires...");
          await prisma.timeSlot.createMany({
            data: timeSlots.map((slot: TimeSlot) => ({
              openingHoursId: openingHours.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true,
            })),
          });
        }
      }

      return prisma.openingHours.findUnique({
        where: { id: openingHours.id },
        include: { timeSlots: true },
      });
    });

    // Log après la transaction réussie
    console.log("Mise à jour terminée avec succès :", result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des horaires :", error);
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
    const currentWeekStart = startOfWeek(new Date(dates[0]), { weekStartsOn: 1 });

    const salonHours = await db.openingHours.findMany({
      where: {
        salon,
        date: {
          gte: currentWeekStart,
          lt: addDays(currentWeekStart, 7)
        }
      },
      include: {
        timeSlots: true
      }
    });

    const openingHoursData: OpeningHoursData = {};

    for (const date of dates) {
      const currentDate = new Date(date);
      const isSunday = currentDate.getDay() === 0;

      if (isSunday) continue;

      const dayHours = salonHours.find(
        h => format(h.date, 'yyyy-MM-dd') === date
      );

      if (dayHours) {
        openingHoursData[date] = {
          id: dayHours.id,
          isClosed: dayHours.isClosed,
          startTime: validateTime(dayHours.startTime),
          endTime: validateTime(dayHours.endTime),
          timeSlots: dayHours.timeSlots.map(slot => ({
            startTime: validateTime(slot.startTime),
            endTime: validateTime(slot.endTime)
          }))
        };
      } else {
        // Fournir une entrée par défaut si aucun horaire n'existe
        openingHoursData[date] = {
          id: null,
          isClosed: false,
          startTime: "",
          endTime: "",
          timeSlots: []
        };
      }
    }

    return NextResponse.json(openingHoursData);

  } catch (error) {
    console.error("Erreur lors de la récupération des horaires :", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des horaires", success: false },
      { status: 500 }
    );
  }
}