"use client";

import { useEffect, useState } from "react";
import {
  addDays,
  format,
  startOfWeek,
  isBefore,
  isSameDay,
  parseISO,
  addMinutes,
} from "date-fns";
import { fr } from "date-fns/locale";

interface WeeklyTimeSlotSelectorProps {
  salon: string;
  durationInMinutes: number;
  onSelect: (date: string, time: string) => void;
}

interface OpeningHour {
  id: number | null;
  isClosed: boolean;
  startTime: string;
  endTime: string;
  salon: string;
}

interface Booking {
  date: string;
  startTime: string;
  duration: number;
}

const daysOfWeek = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const generateTimeSlots = (
  date: string,
  startTime: string,
  endTime: string,
  durationInMinutes: number,
  existingBookings: Booking[] = [],
  timeSlots: { startTime: string; endTime: string }[] = []  // Pauses passées ici
): string[] => {
  const slots: string[] = [];
  let current = parseISO(`${date}T${startTime}`);
  const dayEnd = parseISO(`${date}T${endTime}`);

  // Créer des périodes de disponibilité, excluant les pauses
  const periods = [];
  let periodStart = current;

  // Pour chaque plage de timeSlots, on exclut les pauses
  timeSlots.forEach((breakTime) => {
    const breakStart = parseISO(`${date}T${breakTime.startTime}`);
    const breakEnd = parseISO(`${date}T${breakTime.endTime}`);
    if (isBefore(periodStart, breakStart)) {
      periods.push({ start: periodStart, end: breakStart });  // Période avant la pause
    }
    periodStart = breakEnd;  // La période commence après la pause
  });

  // Ajouter la période après la dernière pause jusqu'à la fermeture
  periods.push({ start: periodStart, end: dayEnd });

  // Générer les créneaux horaires pour chaque période
  periods.forEach((period) => {
    let currentSlotStart = period.start;
    while (isBefore(currentSlotStart, period.end)) {
      const slotEndTime = addMinutes(currentSlotStart, durationInMinutes);
      if (isBefore(slotEndTime, period.end) || isSameDay(slotEndTime, period.end)) {
        const currentSlotTime = format(currentSlotStart, "HH:mm");

        // Vérifier si le créneau est réservé
        const isSlotBooked = existingBookings
          .filter((booking) => booking.date === date)
          .some((booking) => {
            const bookingStart = parseISO(`${date}T${booking.startTime}`);
            const bookingEnd = addMinutes(bookingStart, booking.duration);
            const slotStart = parseISO(`${date}T${currentSlotTime}`);
            const slotEnd = addMinutes(slotStart, durationInMinutes);

            return (
              (isBefore(slotStart, bookingEnd) || isSameDay(slotStart, bookingEnd)) &&
              (isBefore(bookingStart, slotEnd) || isSameDay(bookingStart, slotEnd))
            );
          });

        if (!isSlotBooked) {
          slots.push(currentSlotTime);
        }
      }
      currentSlotStart = slotEndTime;
    }
  });

  return slots;
};

export default function WeeklyTimeSlotSelector({
  salon,
  durationInMinutes,
  onSelect,
}: WeeklyTimeSlotSelectorProps) {
  const [startDate, setStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [weeklyTimeSlots, setWeeklyTimeSlots] = useState<{
    [date: string]: string[];
  }>({});
  const [openingHours, setOpeningHours] = useState<{
    [date: string]: OpeningHour;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [activeSalon, setActiveSalon] = useState<string>(salon);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  const getAlternateSalon = (currentSalon: string) => {
    return currentSalon === "Soye-en-Septaine" ? "Flavigny" : "Soye-en-Septaine";
  };

  const fetchBookings = async (targetSalon: string, dates: string[]) => {
  try {
    const response = await fetch(
      `/api/reservation/onglerie?salon=${encodeURIComponent(targetSalon)}&dates=${dates.join(",")}`
    );
    if (!response.ok) return [];
    
    const data = await response.json();
    // Transformer les données pour qu'elles correspondent au format attendu
    return data.map((reservation: any) => ({
      date: format(new Date(reservation.date), 'yyyy-MM-dd'),
      startTime: format(new Date(reservation.date), 'HH:mm'),
      duration: parseInt(reservation.time)
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return [];
  }
};

  const fetchSalonData = async (targetSalon: string) => {
    setLoading(true);
    setError(null);

    try {
      const dates = daysOfWeek.map((_, i) =>
        format(addDays(startDate, i), "yyyy-MM-dd")
      );

      console.log("==== FETCH SALON DATA ====");
      console.log("Salon cible:", targetSalon);
      console.log("Dates demandées:", dates);

      // Récupérer les réservations existantes
      const bookings = await fetchBookings(targetSalon, dates);
      setExistingBookings(bookings);

      const url = `/api/opening-hours?salon=${encodeURIComponent(
        targetSalon
      )}&dates=${dates.join(",")}`;
      console.log("URL appelée:", url);

      const response = await fetch(url);
      const data = await response.json();
      
      console.log("Réponse de l'API pour", targetSalon, ":");
      console.log(JSON.stringify(data, null, 2));
      console.log("=========================");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des horaires");
      }

      return { dates, data };
    } catch (err) {
      console.error("Erreur détaillée pour", targetSalon, ":", err);
      throw err;
    }
  };

  const processOpeningHours = (dates: string[], data: any, salonName: string) => {
    const newTimeSlots: { [date: string]: string[] } = {};
    const newOpeningHours: { [date: string]: OpeningHour } = {};
  
    dates.forEach((date) => {
      const dayInfo = data[date];
  
      newOpeningHours[date] = {
        id: dayInfo?.id || null,
        isClosed: dayInfo?.isClosed ?? false,
        startTime: dayInfo?.startTime || "",
        endTime: dayInfo?.endTime || "",
        salon: salonName,
      };
  
      if (!dayInfo?.isClosed) {
        const slots = generateTimeSlots(
          date,
          dayInfo?.startTime || "",
          dayInfo?.endTime || "",
          durationInMinutes,
          existingBookings,
          dayInfo?.breaks || []  // On passe les pauses ici
        );
        newTimeSlots[date] = slots;
      } else {
        newTimeSlots[date] = [];
      }
    });
  
    return { newTimeSlots, newOpeningHours };
  };
  
  

  useEffect(() => {
    const loadSalonData = async () => {
      try {
        const { dates, data } = await fetchSalonData(salon);
        const { newTimeSlots, newOpeningHours } = processOpeningHours(dates, data, salon);

        const allDaysClosed = Object.values(newOpeningHours).every(
          (day) => day.isClosed
        );

        if (allDaysClosed) {
          const alternateSalon = getAlternateSalon(salon);
          console.log("Loading alternate salon:", alternateSalon);
          
          const alternateData = await fetchSalonData(alternateSalon);
          const alternateProcessed = processOpeningHours(
            alternateData.dates,
            alternateData.data,
            alternateSalon
          );

          setWeeklyTimeSlots(alternateProcessed.newTimeSlots);
          setOpeningHours(alternateProcessed.newOpeningHours);
          setActiveSalon(alternateSalon);
        } else {
          setWeeklyTimeSlots(newTimeSlots);
          setOpeningHours(newOpeningHours);
          setActiveSalon(salon);
        }
      } catch (err) {
        setError("Impossible de charger les créneaux horaires.");
      } finally {
        setLoading(false);
      }
    };

    loadSalonData();
  }, [startDate, salon, durationInMinutes]);

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    onSelect(date, time);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setStartDate(addDays(startDate, -7))}
          className="text-green font-bold text-lg"
        >
          &larr;
        </button>
        <div className="text-center">
          <h2 className="text-green text-xl font-bold">
            Semaine du {format(startDate, "dd MMM", { locale: fr })} au{" "}
            {format(addDays(startDate, 6), "dd MMM", { locale: fr })}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Salon actif : {activeSalon}</p>
        </div>
        <button
          onClick={() => setStartDate(addDays(startDate, 7))}
          className="text-green font-bold text-lg"
        >
          &rarr;
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 my-4">Chargement des créneaux...</p>
      ) : error ? (
        <p className="text-center text-red-500 my-4">{error}</p>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day, index) => {
            const currentDate = addDays(startDate, index);
            const formattedDate = format(currentDate, "yyyy-MM-dd");
            const displayDate = format(currentDate, "dd MMM", { locale: fr });
            const slots = weeklyTimeSlots[formattedDate] || [];
            const isCurrentDay = isSameDay(currentDate, new Date());
            const isPastDay = isBefore(currentDate, new Date()) && !isCurrentDay;
            const dayHours = openingHours[formattedDate];

            if (!dayHours) {
              return (
                <div key={day} className="flex flex-col items-center">
                  <h3 className="font-semibold text-green mb-2 capitalize">
                    {day}
                    <span className="block text-sm text-gray-500">
                      {displayDate}
                    </span>
                  </h3>
                  <p className="text-center text-gray-400 text-sm">
                    Aucun horaire défini
                  </p>
                </div>
              );
            }

            const isClosed = dayHours?.isClosed;

            return (
              <div key={day} className="flex flex-col items-center">
                <h3 className="font-semibold text-green mb-2 capitalize">
                  {day}
                  <span className="block text-sm text-gray-500">
                    {displayDate}
                  </span>
                </h3>
                <div className="space-y-1 w-full">
                  {isPastDay ? (
                    <p className="text-center text-gray-400 text-sm">Passé</p>
                  ) : isClosed ? (
                    <p className="text-center text-red-500 text-sm">Fermé</p>
                  ) : slots.length > 0 ? (
                    slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.date === formattedDate &&
                        selectedSlot?.time === slot;
                      const endTime = format(
                        addMinutes(parseISO(`${formattedDate}T${slot}`), durationInMinutes),
                        "HH:mm"
                      );

                      return (
                        <button
                          key={`${formattedDate}-${slot}`}
                          onClick={() => handleSlotSelect(formattedDate, slot)}
                          className={`w-full p-2 text-sm rounded text-center transition-colors ${
                            isSelected
                              ? "bg-green text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-green"
                          }`}
                        >
                          {slot.replace(":", "h")} - {endTime.replace(":", "h")}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center text-red-500 text-sm">Aucun créneau</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className="mt-4 p-4 bg-green/10 rounded">
          <p className="text-green text-center font-semibold">
            Créneau sélectionné :{" "}
            {format(new Date(selectedSlot.date), "dd/MM/yyyy", { locale: fr })}{" "}
            de {selectedSlot.time.replace(":", "h")} à{" "}
            {format(
              addMinutes(parseISO(`${selectedSlot.date}T${selectedSlot.time}`), durationInMinutes),
              "HH:mm"
            ).replace(":", "h")}
          </p>
        </div>
      )}
    </div>
  );
}