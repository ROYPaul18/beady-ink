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

const daysOfWeek = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const getDatesString = (startDate: Date): string => {
  return daysOfWeek
    .map((_, i) => format(addDays(startDate, i), "yyyy-MM-dd"))
    .join(",");
};

const generateTimeSlots = (
  date: string,
  startTime: string,
  endTime: string,
  durationInMinutes: number
): string[] => {
  const slots: string[] = [];
  let current = parseISO(`${date}T${startTime}`);
  const end = parseISO(`${date}T${endTime}`);

  while (isBefore(current, end)) {
    const slotEndTime = addMinutes(current, durationInMinutes);
    if (isBefore(slotEndTime, end) || isSameDay(slotEndTime, end)) {
      slots.push(format(current, "HH:mm"));
    }
    current = slotEndTime;
  }
  return slots;
};

const generateTimeSlotsFromData = (
  data: { [key: string]: OpeningHour },
  duration: number
): { [key: string]: string[] } => {
  const timeSlots: { [key: string]: string[] } = {};

  Object.entries(data).forEach(([date, openingHour]) => {
    if (!openingHour.isClosed) {
      timeSlots[date] = generateTimeSlots(
        date,
        openingHour.startTime,
        openingHour.endTime,
        duration
      );
    } else {
      timeSlots[date] = []; // Salon fermé : aucun créneau
    }
  });

  return timeSlots;
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

  useEffect(() => {
    const fetchOpeningHoursAndSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const dates = daysOfWeek.map((_, i) =>
          format(addDays(startDate, i), "yyyy-MM-dd")
        );

        const response = await fetch(
          `/api/opening-hours?salon=${encodeURIComponent(
            salon
          )}&dates=${dates.join(",")}`
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des horaires");
        }

        const data = await response.json();
        const newTimeSlots: { [date: string]: string[] } = {};
        const newOpeningHours: { [date: string]: OpeningHour } = {};

        dates.forEach((date) => {
          const dayInfo = data[date];

          newOpeningHours[date] = {
            id: dayInfo?.id || null,
            isClosed: dayInfo?.isClosed ?? false,
            startTime: dayInfo?.startTime || "",
            endTime: dayInfo?.endTime || "",
            salon: salon,
          };

          // Générer des créneaux uniquement si le salon est ouvert
          if (!dayInfo?.isClosed) {
            newTimeSlots[date] = generateTimeSlots(
              date,
              dayInfo?.startTime || "",
              dayInfo?.endTime || "",
              durationInMinutes
            );
          } else {
            newTimeSlots[date] = [];
          }
        });

        setOpeningHours(newOpeningHours);
        setWeeklyTimeSlots(newTimeSlots);

        // Déterminer et mettre à jour le salon actif
        const activeSalon = determineActiveSalon(newOpeningHours);
        setActiveSalon(activeSalon);

        if (activeSalon !== salon) {
          // Charger les horaires pour l'autre salon si nécessaire
          const alternateResponse = await fetch(
            `/api/opening-hours?salon=${encodeURIComponent(
              activeSalon
            )}&dates=${dates.join(",")}`
          );

          if (alternateResponse.ok) {
            const alternateData = await alternateResponse.json();
            const alternateTimeSlots = generateTimeSlotsFromData(
              alternateData,
              durationInMinutes
            );

            setOpeningHours(alternateData);
            setWeeklyTimeSlots(alternateTimeSlots);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des horaires :", err);
        setError("Impossible de charger les créneaux horaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpeningHoursAndSlots();
  }, [startDate, salon, durationInMinutes]);

  const determineActiveSalon = (openingHoursData: {
    [key: string]: OpeningHour;
  }) => {
    const dates = Object.keys(openingHoursData);
    const allDaysClosed = dates.every(
      (date) => openingHoursData[date]?.isClosed
    );

    if (allDaysClosed) {
      return salon === "Soye-en-Septaine" ? "Flavigny" : "Soye-en-Septaine";
    }
    return salon;
  };

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
