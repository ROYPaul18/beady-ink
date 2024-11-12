import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfWeek, endOfWeek, format } from 'date-fns';

function formatTime(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  const date = new Date(time);
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

async function closeSalonForWeek(salon: string, date: string) {
  const otherSalon = salon === "Flavigny" ? "Soye-en-Septaine" : "Flavigny";
  const weekStart = startOfWeek(new Date(date), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(date), { weekStartsOn: 1 });

  await db.openingHours.updateMany({
    where: {
      salon: otherSalon,
      date: {
        gte: format(weekStart, 'yyyy-MM-dd'),
        lte: format(weekEnd, 'yyyy-MM-dd'),
      }
    },
    data: {
      isClosed: true,
    },
  });
}

function formatDay(jour: string): string {
  return jour.charAt(0).toUpperCase() + jour.slice(1);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { salon, jour, startTime, endTime, isClosed, date } = data;

    if (!salon || !jour || !startTime || !endTime || !date) {
      return NextResponse.json(
        { message: "Tous les champs sont obligatoires." }, 
        { status: 400 }
      );
    }

    if (!isClosed) {
      await closeSalonForWeek(salon, date);
    }

    const result = await db.openingHours.create({
      data: {
        salon,
        jour: jour.toLowerCase(),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        isClosed,
        date: format(new Date(date), 'yyyy-MM-dd'),
      },
    });

    return NextResponse.json({ 
      message: "Heures d'ouverture enregistrées avec succès", 
      result: {
        ...result,
        jour: formatDay(result.jour),
        startTime: formatTime(result.startTime),
        endTime: formatTime(result.endTime)
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des heures d'ouverture :", error);
    return NextResponse.json(
      { message: "Erreur serveur" }, 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let salon = searchParams.get('salon');
    const datesParam = searchParams.get('dates');

    // Log pour vérifier les paramètres reçus
    console.log(`Requête pour le salon: ${salon}, avec les dates: ${datesParam}`);

    if (!salon || !datesParam) {
      console.log("Salon ou dates manquants dans les paramètres.");
      return NextResponse.json(
        { message: "Salon et dates sont requis" }, 
        { status: 400 }
      );
    }

    salon = salon.replace(/\s+/g, '-').toLowerCase();
    const dates = datesParam.split(',');
    const openingHoursByDate: { 
      [date: string]: { 
        startTime: string; 
        endTime: string; 
        isClosed: boolean;
        jour?: string;
      } 
    } = {};

    // Vérification des dates une par une
    for (const dateParam of dates) {
      try {
        const date = new Date(dateParam);
        const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();

        console.log(`Recherche pour la date: ${dateParam}, jour de la semaine: ${dayOfWeek}`);

        const openingHours = await db.openingHours.findFirst({
          where: {
            salon: {
              equals: salon,
              mode: 'insensitive'
            },
            jour: dayOfWeek,
            date: format(date, 'yyyy-MM-dd'),  // Vérification par date précise
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (openingHours) {
          openingHoursByDate[dateParam] = {
            startTime: formatTime(openingHours.startTime),
            endTime: formatTime(openingHours.endTime),
            isClosed: openingHours.isClosed,
            jour: formatDay(dayOfWeek)
          };
        } else {
          // Si aucun horaire n'est trouvé, marquer comme fermé par défaut
          openingHoursByDate[dateParam] = { 
            startTime: '', 
            endTime: '', 
            isClosed: true,
            jour: formatDay(dayOfWeek)
          };
          console.log(`Aucun horaire trouvé pour ${dateParam}, marqué comme fermé.`);
        }
      } catch (innerError) {
        console.error(`Erreur lors du traitement de la date ${dateParam}:`, innerError);
      }
    }

    console.log("Résultat final des horaires:", openingHoursByDate);

    return NextResponse.json(openingHoursByDate);
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires :", error);
    return NextResponse.json(
      { message: "Erreur serveur" }, 
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, salon, jour, startTime, endTime, isClosed, date } = data;

    if (!id || !salon || !jour || !date) {
      return NextResponse.json(
        { message: "ID, salon, jour et date sont obligatoires pour la mise à jour." },
        { status: 400 }
      );
    }

    if (!isClosed) {
      await closeSalonForWeek(salon, date);
    }

    const updatedRecord = await db.openingHours.update({
      where: { id },
      data: {
        salon,
        jour: jour.toLowerCase(),
        startTime,
        endTime,
        isClosed,
        date: format(new Date(date), 'yyyy-MM-dd'),
      },
    });

    return NextResponse.json({
      message: "Heures d'ouverture mises à jour avec succès",
      result: updatedRecord,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des heures d'ouverture :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
