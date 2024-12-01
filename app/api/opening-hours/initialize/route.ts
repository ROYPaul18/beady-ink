import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays, startOfDay, startOfWeek, format } from "date-fns";
import { fr } from "date-fns/locale";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface SalonConfig {
  defaultClosed: boolean;
  defaultTimeSlots: TimeSlot[];
}

export async function GET() {
  try {
    const salonConfigs = {
      Flavigny: {
        defaultClosed: false,
        defaultTimeSlots: [
          { startTime: "12:00", endTime: "14:00" }  // Un créneau de pause de 12:00 à 14:00
        ]
      },
      "Soye-en-Septaine": {
        defaultClosed: true,
        defaultTimeSlots: [
          { startTime: "12:00", endTime: "14:00" }  // Un créneau de pause de 12:00 à 14:00
        ]
      },
    } as const;

    type Salon = keyof typeof salonConfigs;

    const salons: Salon[] = ["Flavigny", "Soye-en-Septaine"];
    const startDate = startOfDay(new Date());
    const daysInYear = 365;
    const allDates = Array.from({ length: daysInYear }, (_, i) =>
      addDays(startDate, i)
    );

    for (const currentDate of allDates) {
      const dayOfWeek = currentDate.getDay();
      const isSunday = dayOfWeek === 0;
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, "yyyy-MM-dd");

      for (const salon of salons) {
        const config = salonConfigs[salon];
        const isClosed = config.defaultClosed || isSunday;

        // Vérifiez si l'enregistrement existe déjà
        const existingEntry = await db.openingHours.findUnique({
          where: {
            salon_date: {
              salon,
              date: currentDate
            }
          }
        });

        if (!existingEntry) {
          // Créer l'entrée principale avec des horaires d'ouverture de 09:00 à 19:00
          // Ajout d'un créneau de pause de 12:00 à 14:00
          const openingHours = await db.openingHours.create({
            data: {
              salon,
              jour: format(currentDate, "eeee", { locale: fr }).toLowerCase(),
              date: currentDate,
              weekKey,
              startTime: isClosed ? null : "09:00",  // Horaires d'ouverture de base à 09:00
              endTime: isClosed ? null : "19:00",    // Horaires d'ouverture de base à 19:00
              isClosed,
              timeSlots: {
                create: isClosed 
                  ? []  // Pas de créneaux si fermé
                  : config.defaultTimeSlots.map(slot => ({
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      isAvailable: true,
                    }))
              }
            }
          });
        } else {
          // Si l'entrée existe déjà, vous pouvez mettre à jour les créneaux horaires
          await db.openingHours.update({
            where: {
              salon_date: {
                salon,
                date: currentDate
              }
            },
            data: {
              timeSlots: {
                create: config.defaultTimeSlots.map(slot => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isAvailable: true,
                }))
              }
            }
          });
        }
      }
    }

    console.log("Vérification et génération terminées avec succès.");
    return NextResponse.json({
      success: true,
      message: "Vérification et génération des horaires et timeSlots terminées.",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification et génération des horaires :", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la vérification et génération des horaires." },
      { status: 500 }
    );
  }
}
