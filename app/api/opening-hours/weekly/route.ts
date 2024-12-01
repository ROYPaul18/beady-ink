import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  eachDayOfInterval,
} from "date-fns";
import { fr } from "date-fns/locale";

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
  const weekKey = format(weekStart, "yyyy-MM-dd"); // Génération de la clé de la semaine

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
      console.error(
        `Erreur lors de la création des horaires pour ${salon} à la date ${date}:`,
        error
      );
    }
  }
}

// GET : Récupère les semaines sélectionnées pour un salon
// Dans /api/opening-hours/weekly/route.ts
export async function GET(req: Request) {
  try {
    // Récupérer toutes les semaines où n'importe quel salon est ouvert
    const openWeeks = await db.openingHours.findMany({
      where: {
        isClosed: false,
      },
      distinct: ['weekKey'],
      orderBy: {
        date: 'asc',
      },
      select: {
        weekKey: true,
      },
    });

    return NextResponse.json({
      selectedWeeks: openWeeks
        .map(week => week.weekKey)
        .filter(Boolean)
        .sort()
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des semaines :", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}

// PUT : Met à jour le statut ouvert/fermé d'une semaine
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

    const weekStart = startOfWeek(new Date(weekKey), { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Mettre à jour les deux salons en une seule transaction
    await db.$transaction(async (prisma) => {
      for (const date of dates) {
        const isSunday = date.getDay() === 0;

        // Pour Soye-en-Septaine
        // D'abord, trouvons ou créons l'enregistrement
        const existingSoyeHours = await prisma.openingHours.findUnique({
          where: {
            salon_date: {
              salon: "Soye-en-Septaine",
              date,
            },
          },
        });

        if (existingSoyeHours) {
          // Si l'enregistrement existe, mettons à jour avec les timeSlots
          await prisma.timeSlot.deleteMany({
            where: { openingHoursId: existingSoyeHours.id }
          });

          await prisma.openingHours.update({
            where: { id: existingSoyeHours.id },
            data: {
              isClosed: isSunday ? true : !salonSoye,
              startTime: isSunday || !salonSoye ? "" : "09:00",
              endTime: isSunday || !salonSoye ? "" : "19:00",
            }
          });

          if (!isSunday && salonSoye) {
            await prisma.timeSlot.createMany({
              data: [
                {
                  openingHoursId: existingSoyeHours.id,
                  startTime: "09:00",
                  endTime: "12:00"
                },
                {
                  openingHoursId: existingSoyeHours.id,
                  startTime: "14:00",
                  endTime: "19:00"
                }
              ]
            });
          }
        } else {
          // Si l'enregistrement n'existe pas, créons-le avec les timeSlots
          await prisma.openingHours.create({
            data: {
              salon: "Soye-en-Septaine",
              date,
              weekKey,
              isClosed: isSunday ? true : !salonSoye,
              startTime: isSunday || !salonSoye ? "" : "09:00",
              endTime: isSunday || !salonSoye ? "" : "19:00",
              jour: format(date, "EEEE", { locale: fr }).toLowerCase(),
              timeSlots: {
                create: !salonSoye || isSunday
                  ? []
                  : [
                      { startTime: "09:00", endTime: "12:00" },
                      { startTime: "14:00", endTime: "19:00" }
                    ]
              }
            }
          });
        }

        // Pour Flavigny (même logique)
        const existingFlavignyHours = await prisma.openingHours.findUnique({
          where: {
            salon_date: {
              salon: "Flavigny",
              date,
            },
          },
        });

        if (existingFlavignyHours) {
          await prisma.timeSlot.deleteMany({
            where: { openingHoursId: existingFlavignyHours.id }
          });

          await prisma.openingHours.update({
            where: { id: existingFlavignyHours.id },
            data: {
              isClosed: isSunday ? true : salonSoye,
              startTime: isSunday || salonSoye ? "" : "09:00",
              endTime: isSunday || salonSoye ? "" : "19:00",
            }
          });

          if (!isSunday && !salonSoye) {
            await prisma.timeSlot.createMany({
              data: [
                {
                  openingHoursId: existingFlavignyHours.id,
                  startTime: "09:00",
                  endTime: "12:00"
                },
                {
                  openingHoursId: existingFlavignyHours.id,
                  startTime: "14:00",
                  endTime: "19:00"
                }
              ]
            });
          }
        } else {
          await prisma.openingHours.create({
            data: {
              salon: "Flavigny",
              date,
              weekKey,
              isClosed: isSunday ? true : salonSoye,
              startTime: isSunday || salonSoye ? "" : "09:00",
              endTime: isSunday || salonSoye ? "" : "19:00",
              jour: format(date, "EEEE", { locale: fr }).toLowerCase(),
              timeSlots: {
                create: salonSoye || isSunday
                  ? []
                  : [
                      { startTime: "09:00", endTime: "12:00" },
                      { startTime: "14:00", endTime: "19:00" }
                    ]
              }
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des semaines :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
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
