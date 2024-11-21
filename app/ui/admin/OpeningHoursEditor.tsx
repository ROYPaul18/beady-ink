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
  const [selectedSalon, setSelectedSalon] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHour[]>(initialHours);
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState<"day" | "week" | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [isSoyeOpen, setIsSoyeOpen] = useState(false);

  const getCurrentWeekKey = () => {
    return format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd");
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const response = await fetch(`/api/opening-hours/weekly`);
        if (response.ok) {
          const data = await response.json();
          const weeks = data.selectedWeeks || [];
          setSelectedWeeks(weeks);

          // Déterminer le salon ouvert
          const currentWeekKey = getCurrentWeekKey();
          const isSoyeWeek = weeks.includes(currentWeekKey);
          const newSelectedSalon = isSoyeWeek ? "Soye-en-Septaine" : "Flavigny";
          setSelectedSalon(newSelectedSalon);

          // Charger les horaires du salon ouvert
          await fetchHoursForWeek(newSelectedSalon);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des semaines :", error);
      }
    };

    initializeData();
  }, []); // Exécuter uniquement au montage du composant

  useEffect(() => {
    fetchSelectedWeeks();
  }, []);

  useEffect(() => {
    if (selectedSalon) {
      fetchHoursForWeek();
    }
  }, [currentWeek, selectedSalon, isSoyeOpen]);

  useEffect(() => {
    const currentWeekKey = getCurrentWeekKey();
    const isSoyeWeek = selectedWeeks.includes(currentWeekKey);
    setSelectedSalon(isSoyeWeek ? "Soye-en-Septaine" : "Flavigny");
  }, [currentWeek, selectedWeeks]);

  useEffect(() => {
    setSelectedSalon(isSoyeOpen ? "Soye-en-Septaine" : "Flavigny");
  }, [isSoyeOpen]);

  const checkIfSoyeIsOpen = async () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const dates = eachDayOfInterval({ start, end }).map((date) =>
      format(date, "yyyy-MM-dd")
    );

    try {
      const response = await fetch(
        `/api/opening-hours?salon=Soye-en-Septaine&dates=${dates.join(",")}`
      );

      if (response.ok) {
        const data: { [key: string]: OpeningHour } = await response.json();

        // Vérifier s'il y a au moins un jour où Soye est ouvert
        const isOpen = Object.values(data).some(
          (day) => day && !day.isClosed
        );

        setIsSoyeOpen(isOpen);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'ouverture de Soye :",
        error
      );
    }
  };

  useEffect(() => {
    checkIfSoyeIsOpen();
  }, [currentWeek]);

  const fetchSelectedWeeks = async () => {
    try {
      const response = await fetch(`/api/opening-hours/weekly`);
      if (response.ok) {
        const data = await response.json();
        const weeks = data.selectedWeeks || [];
        setSelectedWeeks(weeks);

        // Mettez à jour selectedSalon après avoir récupéré selectedWeeks
        const isSoyeWeek = weeks.includes(getCurrentWeekKey());
        const newSelectedSalon = isSoyeWeek ? "Soye-en-Septaine" : "Flavigny";
        setSelectedSalon(newSelectedSalon);

        // Appelez fetchHoursForWeek après avoir mis à jour selectedSalon
        await fetchHoursForWeek(newSelectedSalon);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des semaines :", error);
    }
  };

  const fetchHoursForWeek = async (salonToFetch?: string) => {
    const salon = salonToFetch || (isSoyeOpen ? "Soye-en-Septaine" : "Flavigny");

    try {
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const dates = eachDayOfInterval({ start, end }).map((date) =>
        format(date, "yyyy-MM-dd")
      );

      const response = await fetch(
        `/api/opening-hours?salon=${salon}&dates=${dates.join(",")}`
      );

      if (response.ok) {
        const data: { [key: string]: OpeningHour } = await response.json();
        setHours(
          dates.map((date) => {
            const jour = format(new Date(date), "EEEE", { locale: fr }).toLowerCase();
            const isSunday = jour === "dimanche"; // Vérifie si c'est un dimanche
            return {
              id: data[date]?.id || null,
              date: new Date(date),
              jour,
              salon: salon,
              startTime: data[date]?.startTime || "09:00",
              endTime: data[date]?.endTime || "19:00",
              isClosed:
                data[date]?.isClosed !== undefined ? data[date].isClosed : isSunday,
            };
          })
        );
        setSelectedSalon(salon);
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

  const navigateWeek = useCallback(
    async (direction: "prev" | "next") => {
      const newWeek =
        direction === "prev"
          ? subWeeks(currentWeek, 1)
          : addWeeks(currentWeek, 1);

      setCurrentWeek(newWeek);

      if (selectedWeeks !== null) {
        const newWeekKey = format(
          startOfWeek(newWeek, { weekStartsOn: 1 }),
          "yyyy-MM-dd"
        );

        const isSoyeWeek = selectedWeeks.includes(newWeekKey);

        // Déterminer le salon ouvert
        const newSelectedSalon = isSoyeWeek ? "Soye-en-Septaine" : "Flavigny";
        setSelectedSalon(newSelectedSalon);

        // Charger les horaires du salon ouvert
        await fetchHoursForWeek(newSelectedSalon);
      }
    },
    [currentWeek, selectedWeeks]
  );

  const formatTimeTo24Hour = (time: string): string => {
    const [hour, minute] = time.split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  };

  const closeModal = () => {
    setEditingDay(null);
    setEditingType(null);
  };

  const handleWeekToggle = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);
    const isChecked = event.target.checked;
  
    try {
      // Mettre à jour les horaires de Soye-en-Septaine en conséquence
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const dates = eachDayOfInterval({ start, end });
  
      // Pour chaque jour de la semaine, mettre à jour l'état d'ouverture
      await Promise.all(
        dates.map(async (date) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          const jour = format(date, "EEEE", { locale: fr }).toLowerCase();
  
          const dataToSend = {
            salon: "Soye-en-Septaine",
            jour,
            date: formattedDate, // Utiliser la date formatée
            isClosed: !isChecked, // Fermer si décoché, ouvrir si coché
            startTime: "09:00",
            endTime: "19:00",
          };
  
          console.log("Données envoyées :", dataToSend);
  
          const response = await fetch("/api/opening-hours", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            console.error(
              "Erreur lors de la mise à jour des horaires :",
              errorData
            );
            throw new Error(
              `Erreur lors de la mise à jour des horaires : ${errorData.message}`
            );
          }
        })
      );
  
      // Après la mise à jour, vérifier si Soye est ouvert
      await checkIfSoyeIsOpen();
  
      // Recharger selectedWeeks pour refléter les changements
      await fetchSelectedWeeks();
  
      // Mettre à jour selectedSalon en fonction du nouvel état
      setSelectedSalon(isChecked ? "Soye-en-Septaine" : "Flavigny");
  
      // Recharger les horaires
      await fetchHoursForWeek();
    } catch (error) {
      console.error(
        "Erreur lors de la bascule de l'ouverture de Soye :",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };
  

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
      const response = await fetch("/api/opening-hours/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        closeModal();
        await fetchHoursForWeek();
      } else {
        console.error("Erreur lors de la mise à jour:", await response.json());
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
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
            {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM/yyyy")}
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
            checked={isSoyeOpen}
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
          const activeSalon = isSoyeOpen ? "Soye-en-Septaine" : "Flavigny";

          const dayHours = hours.find(
            (h) =>
              h.jour.toLowerCase() === day.dayName && h.salon === activeSalon
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
                    dayHours?.isClosed ? "bg-gray-300" : "bg-green text-white"
                  }`}
                >
                  {dayHours?.isClosed ? "Fermé" : "Ouvert"}
                </div>
                <span className="px-3 py-1 rounded-full bg-green text-white">
                  {activeSalon}
                </span>
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
                  setHours((prev) =>
                    prev.map((h) =>
                      h.jour.toLowerCase() === editingDay &&
                      h.salon === selectedSalon
                        ? { ...h, isClosed: e.target.checked }
                        : h
                    )
                  )
                }
                className="mr-2"
              />
              Fermé
            </label>

            {!hours.find(
              (h) =>
                h.jour.toLowerCase() === editingDay &&
                h.salon === selectedSalon
            )?.isClosed && (
              <>
                <div className="mb-4">
                  <label className="block mb-2">Heure d'ouverture</label>
                  <input
                    type="time"
                    value={
                      hours.find(
                        (h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                      )?.startTime || ""
                    }
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                            ? { ...h, startTime: e.target.value }
                            : h
                        )
                      )
                    }
                    step="900"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Heure de fermeture</label>
                  <input
                    type="time"
                    value={
                      hours.find(
                        (h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                      )?.endTime || ""
                    }
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((h) =>
                          h.jour.toLowerCase() === editingDay &&
                          h.salon === selectedSalon
                            ? { ...h, endTime: e.target.value }
                            : h
                        )
                      )
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
