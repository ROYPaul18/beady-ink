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
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "14:00", endTime: "19:00" }
        ]
      },
      "Soye-en-Septaine": {
        defaultClosed: true,
        defaultTimeSlots: [
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "14:00", endTime: "19:00" }
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
          // Créer l'entrée principale
          const openingHours = await db.openingHours.create({
            data: {
              salon,
              jour: format(currentDate, "eeee", { locale: fr }).toLowerCase(),
              date: currentDate,
              weekKey,
              startTime: isClosed ? null : "09:00",
              endTime: isClosed ? null : "19:00",
              isClosed,
              timeSlots: {
                create: isClosed 
                  ? []
                  : config.defaultTimeSlots.map(slot => ({
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