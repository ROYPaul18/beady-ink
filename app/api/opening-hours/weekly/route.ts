import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, format, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeekToggleRequest {
  weekKey: string;
  salonSoye: boolean;
  salon: string; // Salon sélectionné
}
async function ensureOpeningHoursExist(
  salon: string,
  weekStart: Date,
  weekEnd: Date,
  isClosed: boolean
) {
  const dates = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekKey = format(weekStart, 'yyyy-MM-dd'); // Génération de la clé de la semaine

  for (const date of dates) {
    try {
      await db.openingHours.upsert({
        where: {
          salon_date: { salon, date },
        },
        update: {}, // Rien à mettre à jour ici
        create: {
          salon,
          jour: format(date, "eeee", { locale: fr }).toLowerCase(),
          date,
          weekKey, // Ajoutez ici
          startTime: isClosed ? "" : "09:00",
          endTime: isClosed ? "" : "19:00",
          isClosed,
        },
      });
    } catch (error) {
      console.error(`Erreur lors de la création des horaires pour ${salon} à la date ${date}:`, error);
    }
  }
}


// Récupération des semaines sélectionnées pour un salon spécifique
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salon = searchParams.get("salon");

    if (!salon) {
      return NextResponse.json(
        { message: "Le salon est requis." },
        { status: 400 }
      );
    }

    console.log("Requête GET reçue avec salon :", salon);

    // Ajoutez ici la logique pour récupérer les semaines sélectionnées
    const selectedWeeks = await db.openingHours.findMany({
      where: { salon },
      select: { weekKey: true },
    });

    console.log("Semaines récupérées :", selectedWeeks);

    return NextResponse.json({ selectedWeeks });
  } catch (error) {
    console.error("Erreur lors de la récupération des semaines :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}


// Mise à jour ou création des horaires hebdomadaires
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { weekKey, salonSoye } = body;

    if (!weekKey) {
      return NextResponse.json(
        { message: "La clé de la semaine est requise." },
        { status: 400 }
      );
    }

    console.log("Requête reçue pour mise à jour hebdomadaire :", { weekKey, salonSoye });

    const weekStart = startOfWeek(new Date(weekKey), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(weekKey), { weekStartsOn: 1 });

    const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    for (const date of dates) {
      const dayString = format(date, "yyyy-MM-dd");

      // Vérification et création des données pour chaque salon
      for (const salon of ["Soye-en-Septaine", "Flavigny"]) {
        const isClosed = salon === "Soye-en-Septaine" ? !salonSoye : salonSoye;

        let openingHour = await db.openingHours.findFirst({
          where: { salon, date },
        });

        if (!openingHour) {
          console.log(`Création d'une entrée par défaut pour ${salon} à la date ${dayString}`);
          await db.openingHours.create({
            data: {
              salon,
              jour: format(date, "eeee", { locale: fr }).toLowerCase(),
              date,
              isClosed,
              startTime: isClosed ? "" : "09:00",
              endTime: isClosed ? "" : "19:00",
            },
          });
        } else {
          console.log(`Mise à jour de l'entrée existante pour ${salon} à la date ${dayString}`);
          await db.openingHours.update({
            where: { id: openingHour.id },
            data: {
              isClosed,
              startTime: isClosed ? "" : "09:00",
              endTime: isClosed ? "" : "19:00",
            },
          });
        }
      }
    }

    console.log(`Mise à jour hebdomadaire terminée pour la semaine : ${weekKey}`);
    return NextResponse.json({ success: true, message: "Mise à jour réussie." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des horaires :", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}



// Suppression des horaires d'un salon spécifique pour un jour donné
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salon = searchParams.get("salon");
    const jour = searchParams.get("jour");
    if (!salon || !jour) {
      return NextResponse.json(
        { message: "Le salon et le jour sont requis" },
        { status: 400 }
      );
    }

    await db.openingHours.deleteMany({
      where: {
        salon,
        jour: jour.toLowerCase(),
      },
    });

    console.log(`Horaires supprimés pour le salon ${salon} le jour ${jour}`);
    return NextResponse.json({
      message: "Horaires supprimés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des horaires :", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}
