import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salon = searchParams.get('salon');
    const datesParam = searchParams.get('dates');
    const durationParam = searchParams.get('durationInMinutes');

    if (!salon || !datesParam || !durationParam) {
      return NextResponse.json(
        { message: "Salon, dates et durée sont requis" }, 
        { status: 400 }
      );
    }

    const durationInMinutes = parseInt(durationParam, 10);
    let dates: string[];

    try {
      dates = JSON.parse(datesParam);
      if (!Array.isArray(dates)) throw new Error("Format de dates invalide");
    } catch (error) {
      return NextResponse.json(
        { message: "Format de dates invalide" }, 
        { status: 400 }
      );
    }

    // Récupérer les horaires d'ouverture pour le salon
    const openingHours = await db.openingHours.findMany({
      where: { salon }
    });

    if (!openingHours.length) {
      return NextResponse.json(
        { message: `Aucun horaire d'ouverture trouvé pour le salon ${salon}` },
        { status: 404 }
      );
    }

    console.log('Opening hours retrieved:', openingHours);

    // Récupérer les réservations existantes
    const existingReservations = await db.reservation.findMany({
      where: {
        date: { in: dates.map(d => new Date(d)) },
        salon,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: {
        prestations: { select: { duration: true } }
      }
    });

    console.log('Existing reservations retrieved:', existingReservations);

    const result: { [date: string]: string[] } = {};

    for (const dateParam of dates) {
      const date = new Date(dateParam);
      const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();

      const dayHours = openingHours.find(h => h.jour.toLowerCase() === dayOfWeek);

      if (!dayHours) {
        console.log(`Pas d'horaires trouvés pour ${dayOfWeek} dans le salon ${salon}`);
        result[dateParam] = [];
        continue;
      }

      if (dayHours.isClosed) {
        console.log(`Le salon ${salon} est fermé le ${dayOfWeek}`);
        result[dateParam] = [];
        continue;
      }

      const slots = [];
      let currentTime = new Date(`${dateParam}T${dayHours.startTime}`);
      const endTime = new Date(`${dateParam}T${dayHours.endTime}`);

      // Dernière heure de début possible pour un créneau complet
      const lastPossibleStartTime = new Date(endTime.getTime() - durationInMinutes * 60000);

      const dayReservations = existingReservations.filter(reservation =>
        reservation.date.toISOString().split('T')[0] === dateParam
      );

      console.log(`Generating slots for ${dateParam} - Start Time: ${dayHours.startTime}, End Time: ${dayHours.endTime}`);

      // Générer les créneaux horaires
      while (currentTime <= lastPossibleStartTime) {
        const slotEndTime = new Date(currentTime.getTime() + durationInMinutes * 60000);
        const slotTimeString = currentTime.toISOString().slice(11, 16);

        console.log(`Checking slot ${slotTimeString} - ${slotEndTime.toISOString().slice(11, 16)}`);

        const isAvailable = !dayReservations.some(reservation => {
          const reservationStartTime = new Date(`${dateParam}T${reservation.time}`);
          const reservationDuration = reservation.prestations.reduce(
            (total, prestation) => total + prestation.duration, 
            0
          );
          const reservationEndTime = new Date(reservationStartTime.getTime() + reservationDuration * 60000);

          // Log each reservation and check for conflicts
          console.log(`Reservation from ${reservationStartTime.toISOString().slice(11, 16)} to ${reservationEndTime.toISOString().slice(11, 16)}`);
          
          return (
            (currentTime >= reservationStartTime && currentTime < reservationEndTime) ||
            (slotEndTime > reservationStartTime && slotEndTime <= reservationEndTime) ||
            (currentTime <= reservationStartTime && slotEndTime >= reservationEndTime)
          );
        });

        // Ajouter le créneau s'il est disponible et respecte les contraintes de temps
        if (isAvailable) {
          const now = new Date();
          const isToday = date.toDateString() === now.toDateString();
          const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

          if (!isToday || currentTime >= thirtyMinutesFromNow) {
            slots.push(slotTimeString);
          }
        } else {
          console.log(`Slot ${slotTimeString} is unavailable due to a conflict`);
        }

        currentTime = new Date(currentTime.getTime() + 15 * 60000);
      }

      result[dateParam] = slots;
      console.log(`Generated slots for ${dateParam}:`, slots);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la génération des créneaux:', error);
    return NextResponse.json(
      { message: "Erreur serveur" }, 
      { status: 500 }
    );
  }
}
