import { db } from "@/lib/db";
import { addDays, format } from "date-fns";

export async function initializeHours(salon: string) {
  const startDate = new Date();
  const defaultHours = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(startDate, i);
    const jour = currentDate.toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase();

    defaultHours.push({
      salon,
      jour,
      date: currentDate,
      startTime: "09:00",
      endTime: "19:00",
      isClosed: jour === "dimanche",
    });
  }

  await db.openingHours.createMany({ data: defaultHours });

  return await db.openingHours.findMany({
    where: { salon },
    orderBy: { date: "asc" },
  });
}
