import { startOfWeek, endOfWeek } from 'date-fns';
import { db } from '@/lib/db';

// Format les horaires pour le stockage
export function formatTime(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  const date = new Date(time);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Ferme l'autre salon pour une semaine donnée
export async function closeOtherSalonForWeek(currentSalon: string, date: string) {
  const otherSalon = currentSalon === "Flavigny" ? "Soye-en-Septaine" : "Flavigny";
  const weekStart = startOfWeek(new Date(date), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(date), { weekStartsOn: 1 });

  await db.openingHours.updateMany({
    where: {
      salon: otherSalon,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    data: {
      isClosed: true,
      startTime: "",
      endTime: "",
    },
  });
}
