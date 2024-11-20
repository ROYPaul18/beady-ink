import { db } from '../lib/db'; // Chemin vers votre Prisma client
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function generateOpeningHoursForYear() {
  const salons = ["Flavigny", "Soye-en-Septaine"];
  const startDate = new Date();
  const daysInYear = 365;

  for (let i = 0; i < daysInYear; i++) {
    const currentDate = addDays(startDate, i);
    
    // Calcul de la `weekKey` pour le jour actuel
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd'); // Associe le début de semaine à la clé

    const dayOfWeek = currentDate.getDay();
    const isSunday = dayOfWeek === 0;

    for (const salon of salons) {
      const isClosed = salon === "Soye-en-Septaine" || isSunday;

      // Vérifiez si l'entrée existe déjà
      const existingRecord = await db.openingHours.findFirst({
        where: {
          salon,
          date: currentDate,
        },
      });

      if (!existingRecord) {
        // Créez l'entrée avec weekKey
        await db.openingHours.create({
          data: {
            salon,
            jour: format(currentDate, "eeee", { locale: fr }).toLowerCase(),
            date: currentDate,
            weekKey, // Assurez-vous que la clé de semaine est définie
            startTime: isClosed ? "" : "09:00",
            endTime: isClosed ? "" : "19:00",
            isClosed: isClosed,
          },
        });
      }
    }
  }
  console.log("Horaires d'ouverture générés pour un an.");
}
