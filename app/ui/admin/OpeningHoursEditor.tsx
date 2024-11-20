"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addWeeks,
  subWeeks,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isBefore,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fr } from "date-fns/locale";

interface OpeningHour {
  id?: number | null;
  salon: string;
  jour: string;
  startTime: string;
  endTime: string;
  isClosed: boolean;
  date: Date;
}

interface OpeningHoursEditorProps {
  initialHours: OpeningHour[];
  salon: string;
}

export default function OpeningHoursEditor({
  initialHours,
  salon,
}: OpeningHoursEditorProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSalon, setSelectedSalon] = useState(salon);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHour[]>(initialHours);
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState<"day" | "week" | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSalon(salon);
  }, [salon]);

  useEffect(() => {
    fetchSelectedWeeks();
  }, [salon]);

  useEffect(() => {
    fetchHoursForWeek();
  }, [currentWeek, selectedSalon]);

  const fetchSelectedWeeks = async () => {
    try {
      console.log("Requête API pour récupérer les semaines :", selectedSalon);
      const response = await fetch(
        `/api/opening-hours/weekly?salon=${selectedSalon}`
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedWeeks(data.selectedWeeks || []);
      } else {
        console.error(
          "Erreur lors de la récupération des semaines :",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des semaines :", error);
    }
  };

  const fetchHoursForWeek = async () => {
    try {
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const dates = eachDayOfInterval({ start, end }).map((date) =>
        format(date, "yyyy-MM-dd")
      );

      console.log(`Requête API pour ${selectedSalon} avec dates :`, dates);

      const response = await fetch(
        `/api/opening-hours?salon=${selectedSalon}&dates=${dates.join(",")}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Données horaires API :", data);

        setHours(
          dates.map((date) => ({
            id: data[date]?.id || null,
            date: new Date(date),
            jour: format(new Date(date), "EEEE", { locale: fr }).toLowerCase(), // Ajout de 'jour'
            salon: selectedSalon,
            startTime: data[date]?.startTime || "09:00",
            endTime: data[date]?.endTime || "19:00",
            isClosed: data[date]?.isClosed || false,
          }))
        );
      } else {
        console.error(
          "Erreur API lors de la récupération des horaires :",
          await response.json()
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des horaires :", error);
    }
  };

  const getCurrentWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end }).map((date) => ({
      date,
      formattedDate: format(date, "dd/MM/yyyy"),
      dayName: format(date, "EEEE", { locale: fr }).toLowerCase(),
      weekKey: format(start, "yyyy-MM-dd"),
    }));
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((current) =>
      direction === "prev" ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

  const closeModal = () => {
    setEditingDay(null);
    setEditingType(null);
  };

  const handleWeekToggle = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsLoading(true);
      const weekKey = format(
        startOfWeek(currentWeek, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      const isChecked = event.target.checked;

      // Mise à jour optimiste de selectedWeeks
      setSelectedWeeks((prev) =>
        isChecked ? [...prev, weekKey] : prev.filter((w) => w !== weekKey)
      );

      try {
        const response = await fetch("/api/opening-hours/weekly", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            weekKey,
            salonSoye: isChecked,
          }),
        });

        if (response.ok) {
          // Si la mise à jour du backend est réussie, met à jour selectedSalon
          setSelectedSalon(isChecked ? "Soye-en-Septaine" : "Flavigny");
          await fetchHoursForWeek();
        } else {
          console.error(
            "Erreur API pour la mise à jour :",
            await response.json()
          );
          // En cas d'erreur, revert l'état
          setSelectedWeeks((prev) =>
            isChecked ? prev.filter((w) => w !== weekKey) : [...prev, weekKey]
          );
        }
      } catch (error) {
        console.error("Erreur lors de la bascule de salon :", error);
        // En cas d'erreur, revert l'état
        setSelectedWeeks((prev) =>
          isChecked ? prev.filter((w) => w !== weekKey) : [...prev, weekKey]
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentWeek]
  );

  const saveDayChanges = async () => {
    if (!editingDay) return;

    const dayHours = hours.find((h) => h.jour.toLowerCase() === editingDay);
    if (!dayHours) return;

    const data = {
      id: dayHours.id,
      salon: dayHours.salon,
      jour: dayHours.jour,
      startTime: dayHours.startTime,
      endTime: dayHours.endTime,
      isClosed: dayHours.isClosed,
      date: dayHours.date,
    };

    try {
      const response = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        closeModal();
        fetchHoursForWeek();
      } else {
        const errorData = await response.json();
        console.error("Erreur de réponse:", errorData);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const formatTimeTo24Hour = (time: string): string => {
    const [hour, minute] = time.split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  };

  return (
    <div className="mt-8 min-h-[50vh] xl:min-h-[60vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green">
          Horaires d'Ouverture - {selectedSalon}
        </h2>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 rounded-full"
            disabled={isLoading}
          >
            <ChevronLeft className="w-6 h-6 bg-white text-green rounded-full" />
          </button>

          <span className="text-lg font-medium bg-white rounded-xl text-green p-2">
            Semaine du{" "}
            {format(
              startOfWeek(currentWeek, { weekStartsOn: 1 }),
              "dd/MM/yyyy"
            )}
          </span>

          <button
            onClick={() => navigateWeek("next")}
            className="p-2 rounded-full"
            disabled={isLoading}
          >
            <ChevronRight className="w-6 h-6 bg-white text-green rounded-full" />
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="soye-open"
            checked={selectedWeeks.includes(
              format(
                startOfWeek(currentWeek, { weekStartsOn: 1 }),
                "yyyy-MM-dd"
              )
            )}
            onChange={handleWeekToggle}
            disabled={isLoading}
            className="w-4 h-4 text-green border-gray-300 rounded focus:ring-green"
          />
          <label
            htmlFor="soye-open"
            className="text-sm font-medium text-green cursor-pointer"
          >
            Soye en Septaine est ouvert cette semaine
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {getCurrentWeekDays().map((day) => {
          const dayHours = hours.find(
            (h) =>
              h.jour.toLowerCase() === day.dayName && h.salon === selectedSalon
          );
          const isPast =
            isBefore(day.date, new Date()) && !isSameDay(day.date, new Date());

          return (
            <div
              key={day.formattedDate}
              className={`flex justify-between items-center p-4 border rounded-lg ${
                isPast ? "bg-gray-100 text-gray-500" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-medium capitalize">{day.dayName}</span>
                <span className="text-gray-500">{day.formattedDate}</span>
                {dayHours && !dayHours.isClosed && (
                  <span className="text-gray-600">
                    {formatTimeTo24Hour(dayHours.startTime)} -{" "}
                    {formatTimeTo24Hour(dayHours.endTime)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`px-3 py-1 rounded-full ${
                    dayHours && dayHours.isClosed
                      ? "bg-gray-300"
                      : "bg-green text-white"
                  }`}
                >
                  {dayHours && dayHours.isClosed ? "Fermé" : "Ouvert"}
                </div>
                {dayHours && (
                  <span className="px-3 py-1 rounded-full bg-green text-white">
                    {dayHours.salon}
                  </span>
                )}
                <button
                  onClick={() => {
                    setEditingDay(day.dayName);
                    setEditingType("day");
                  }}
                  className={`text-green underline ml-4 ${
                    isPast ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  Modifier
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingType === "day" && editingDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Modification des horaires - {editingDay}
            </h3>

            <div className="text-gray-600 mb-4">
              {
                getCurrentWeekDays().find((day) => day.dayName === editingDay)
                  ?.formattedDate
              }
            </div>

            <label className="block mb-4">
              <input
                type="checkbox"
                checked={
                  hours.find(
                    (h) =>
                      h.jour.toLowerCase() === editingDay &&
                      h.salon === selectedSalon
                  )?.isClosed || false
                }
                onChange={(e) =>
                  setHours((prev) => {
                    return prev.map((h) =>
                      h.jour.toLowerCase() === editingDay &&
                      h.salon === selectedSalon
                        ? { ...h, isClosed: e.target.checked }
                        : h
                    );
                  })
                }
                className="mr-2"
              />
              Fermé
            </label>

            {!hours.find(
              (h) =>
                h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
            )?.isClosed && (
              <>
                <div className="mb-4">
                  <label className="block mb-2">Heure d'ouverture</label>
                  <input
                    type="time"
                    value={formatTimeTo24Hour(
                      hours.find(
                        (h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                      )?.startTime || ""
                    )}
                    onChange={(e) =>
                      setHours((prev) => {
                        return prev.map((h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                            ? { ...h, startTime: e.target.value }
                            : h
                        );
                      })
                    }
                    step="900"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Heure de fermeture</label>
                  <input
                    type="time"
                    value={formatTimeTo24Hour(
                      hours.find(
                        (h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                      )?.endTime || ""
                    )}
                    onChange={(e) =>
                      setHours((prev) => {
                        return prev.map((h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                            ? { ...h, endTime: e.target.value }
                            : h
                        );
                      })
                    }
                    step="900"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded hover:bg-gray-100 bg-white"
              >
                Annuler
              </button>
              <button
                onClick={saveDayChanges}
                className="px-4 py-2 bg-green text-white rounded hover:bg-green-600"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
