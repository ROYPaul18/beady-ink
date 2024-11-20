import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays, startOfDay, startOfWeek, format } from "date-fns";
import { fr } from "date-fns/locale";

export async function GET() {
  try {
    const salons = ["Flavigny", "Soye-en-Septaine"];
    const startDate = startOfDay(new Date()); // Date de départ : aujourd'hui
    const daysInYear = 365; // Générer les horaires pour un an

    console.log("Génération des horaires d'ouverture pour un an.");

    // Parcourir chaque jour de l'année
    for (let i = 0; i < daysInYear; i++) {
      const currentDate = addDays(startDate, i);
      const dayOfWeek = currentDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const isSunday = dayOfWeek === 0;

      // Calculer la `weekKey` pour la semaine de la date actuelle
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, "yyyy-MM-dd");

      for (const salon of salons) {
        const isClosed = salon === "Soye-en-Septaine" || isSunday;

        // Vérifier si un enregistrement existe déjà
        const existingRecord = await db.openingHours.findFirst({
          where: {
            salon,
            date: currentDate,
          },
        });

        if (!existingRecord) {
          // Créer un nouvel horaire si aucun horaire n'existe déjà
          await db.openingHours.create({
            data: {
              salon,
              jour: format(currentDate, "eeee", { locale: fr }).toLowerCase(),
              date: currentDate,
              weekKey, // Ajouter la `weekKey`
              startTime: isClosed ? "" : "09:00",
              endTime: isClosed ? "" : "19:00",
              isClosed: isClosed,
            },
          });
        }
      }
    }

    console.log("Horaires d'ouverture générés avec succès pour un an.");
    return NextResponse.json({
      success: true,
      message: "Horaires générés avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la génération des horaires :", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la génération des horaires." },
      { status: 500 }
    );
  }
}
