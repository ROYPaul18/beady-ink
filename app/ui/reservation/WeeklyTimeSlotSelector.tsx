'use client';

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

const daysOfWeek = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

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
  const [openDays, setOpenDays] = useState<{ [date: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);

  const effectiveDuration = durationInMinutes || 15;

  // Fonction pour récupérer les horaires d'ouverture et générer les créneaux
  const fetchOpeningHoursAndSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const dates = daysOfWeek.map((_, i) =>
        format(addDays(startDate, i), "yyyy-MM-dd")
      );
      const queryString = `salon=${encodeURIComponent(
        salon
      )}&dates=${dates.join(",")}`;
      console.log(
        "Requête envoyée à l'API :",
        `/api/opening-hours?${queryString}`
      );

      const response = await fetch(`/api/opening-hours?${queryString}`);
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des créneaux et horaires d'ouverture"
        );
      }

      const data = await response.json();

      const newTimeSlots: { [date: string]: string[] } = {};
      const newOpenDays: { [date: string]: boolean } = {};

      dates.forEach((date) => {
        const dayInfo = data[date];
        console.log(`Date : ${date}`, dayInfo);

        newOpenDays[date] = !dayInfo?.isClosed;

        if (!dayInfo?.isClosed && dayInfo?.startTime && dayInfo?.endTime) {
          newTimeSlots[date] = generateTimeSlots(
            date,
            dayInfo.startTime,
            dayInfo.endTime
          );
        } else {
          newTimeSlots[date] = [];
        }
      });

      console.log("newOpenDays :", newOpenDays);
      console.log("newTimeSlots :", newTimeSlots);

      setWeeklyTimeSlots(newTimeSlots);
      setOpenDays(newOpenDays);
    } catch (err) {
      console.error("Error fetching opening hours and slots:", err);
      setError("Impossible de charger les créneaux horaires.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer les créneaux horaires pour chaque jour donné
  const generateTimeSlots = (
    date: string,
    startTime: string,
    endTime: string
  ): string[] => {
    const slots: string[] = [];
    let current = parseISO(`${date}T${startTime}`);
    const end = parseISO(`${date}T${endTime}`);

    while (isBefore(current, end)) {
      const slotEndTime = addMinutes(current, effectiveDuration);
      // Vérifie si le créneau final ne dépasse pas l'heure de fin
      if (isBefore(slotEndTime, end) || isSameDay(slotEndTime, end)) {
        slots.push(format(current, "HH:mm"));
      }
      current = slotEndTime;
    }
    return slots;
  };

  useEffect(() => {
    fetchOpeningHoursAndSlots();
  }, [startDate, salon]);

  // Gérer la sélection d'un créneau
  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    onSelect(date, time);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            const newDate = addDays(startDate, -7);
            if (
              !isBefore(newDate, startOfWeek(new Date(), { weekStartsOn: 1 }))
            ) {
              setStartDate(newDate);
            }
          }}
          className={`text-green font-bold text-lg ${
            isBefore(startDate, startOfWeek(new Date(), { weekStartsOn: 1 }))
              ? "text-gray-300 cursor-not-allowed"
              : ""
          }`}
          disabled={isBefore(
            startDate,
            startOfWeek(new Date(), { weekStartsOn: 1 })
          )}
        >
          &larr;
        </button>
        <h2 className="text-green text-xl font-bold">
          Semaine du {format(startDate, "dd MMM", { locale: fr })} au{" "}
          {format(addDays(startDate, 6), "dd MMM", { locale: fr })}
        </h2>
        <button
          onClick={() => setStartDate((date) => addDays(date, 7))}
          className="text-green font-bold text-lg"
        >
          &rarr;
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 my-4">
          Chargement des créneaux...
        </p>
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
            const isPastDay =
              isBefore(currentDate, new Date()) && !isCurrentDay;
            const isOpen = openDays[formattedDate];

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
                  ) : !isOpen ? (
                    <p className="text-center text-red-500 text-sm">Fermé</p>
                  ) : slots.length > 0 ? (
                    slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.date === formattedDate &&
                        selectedSlot?.time === slot;
                      const endTime = format(
                        addMinutes(
                          parseISO(`${formattedDate}T${slot}`),
                          effectiveDuration
                        ),
                        "HH:mm"
                      );

                      return (
                        <button
                          key={`${formattedDate}-${slot}`}
                          onClick={() =>
                            handleSlotSelect(formattedDate, slot)
                          }
                          className={`w-full p-2 text-sm rounded text-center transition-colors ${
                            isSelected
                              ? "bg-green text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-green"
                          }`}
                        >
                          {slot.replace(":", "h")} -{" "}
                          {endTime.replace(":", "h")}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center text-red-500 text-sm">Fermé</p>
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
            {format(new Date(selectedSlot.date), "dd/MM/yyyy", {
              locale: fr,
            })}{" "}
            de {selectedSlot.time.replace(":", "h")} à{" "}
            {format(
              addMinutes(
                parseISO(`${selectedSlot.date}T${selectedSlot.time}`),
                effectiveDuration
              ),
              "HH:mm"
            ).replace(":", "h")}
            <br />
            <span className="text-sm">
              Durée : {effectiveDuration} minutes
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
