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
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { fr } from "date-fns/locale";
import EditHoursModal from "./EditHoursModal";
import { OpeningHour } from "@/lib/types";

interface TimeSlot {
  startTime: string;
  endTime: string;
}
interface TimeRange {
  startTime: string;
  endTime: string;
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
  const [selectedSalon, setSelectedSalon] = useState<string | null>(
    salon || "Flavigny"
  );
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHour[]>(initialHours);
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState<"day" | "week" | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [isSoyeOpen, setIsSoyeOpen] = useState(false);

  const getCurrentWeekKey = useCallback(() => {
    return format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd");
  }, [currentWeek]);

  const checkIfSoyeIsOpen = useCallback(async () => {
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
        console.log("Données Soye:", data);
        const isOpen = Object.values(data).some((day) => day && !day.isClosed);
        setIsSoyeOpen(isOpen);
        return isOpen;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification de Soye :", error);
      return false;
    }
  }, [currentWeek]);

  const fetchHoursForWeek = useCallback(
    async (salonToFetch?: string) => {
      const salon = salonToFetch || selectedSalon;
      if (!salon) return;

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

          // Log pour vérifier que les données sont bien récupérées
          console.log("Données récupérées depuis l'API:", data);

          setHours((prevHours) => {
            return dates.map((date) => {
              const jour = format(new Date(date), "EEEE", {
                locale: fr,
              }).toLowerCase();
              const isSunday = jour === "dimanche";
              const dayData = data[date];

              if (isSunday || (dayData && dayData.isClosed)) {
                return {
                  id: dayData?.id || null,
                  date: new Date(date),
                  jour,
                  salon,
                  isClosed: true,
                  startTime: "",
                  endTime: "",
                  timeSlots: [],
                };
              }

              const isClosed = dayData ? dayData.isClosed : false;
              const timeSlots = !isClosed
                ? dayData?.timeSlots?.length
                  ? dayData.timeSlots
                  : [{ startTime: "12:00", endTime: "14:00" }]
                : [{ startTime: "12:00", endTime: "14:00" }];

              return {
                id: dayData?.id || null,
                date: new Date(date),
                jour,
                salon,
                isClosed,
                startTime: dayData?.startTime || "09:00",
                endTime: dayData?.endTime || "19:00",
                timeSlots,
              };
            });
          });
        } else {
          console.error("Erreur de réponse de l'API:", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des horaires :", error);
      }
    },
    [currentWeek, selectedSalon]
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/opening-hours/weekly`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des semaines");
        }

        const data = await response.json();
        const weeks = data.selectedWeeks || [];
        setSelectedWeeks(weeks);

        const currentWeekKey = getCurrentWeekKey();
        const isSoyeWeek = weeks.includes(currentWeekKey);
        const initialSalon = isSoyeWeek ? "Soye-en-Septaine" : "Flavigny";
        setSelectedSalon(initialSalon);
        setIsSoyeOpen(isSoyeWeek);

        await fetchHoursForWeek(initialSalon);
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [currentWeek]);

  useEffect(() => {
    if (selectedSalon && !isLoading) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const isOpen = await checkIfSoyeIsOpen();
          await fetchHoursForWeek(selectedSalon);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [currentWeek, selectedSalon]);

  useEffect(() => {
    if (selectedSalon) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const isOpen = await checkIfSoyeIsOpen(); // Vérifiez si le salon est ouvert
          const shouldBeSoye = isOpen && selectedSalon !== "Soye-en-Septaine";
          const shouldBeFlavigny = !isOpen && selectedSalon !== "Flavigny";

          if (shouldBeSoye || shouldBeFlavigny) {
            const newSalon = isOpen ? "Soye-en-Septaine" : "Flavigny";
            setSelectedSalon(newSalon);

            // Récupérez les horaires du salon sélectionné et mettez à jour l'état `isClosed`
            await fetchHoursForWeek(newSalon);
          } else {
            // Si le salon est déjà correct, récupérez simplement les horaires
            await fetchHoursForWeek(selectedSalon);
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedSalon, checkIfSoyeIsOpen, fetchHoursForWeek]);

  const getCurrentWeekDays = useCallback(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end }).map((date) => ({
      date,
      formattedDate: format(date, "dd/MM/yyyy"),
      dayName: format(date, "EEEE", { locale: fr }).toLowerCase(),
      weekKey: format(start, "yyyy-MM-dd"),
    }));
  }, [currentWeek]);

  const navigateWeek = useCallback(
    async (direction: "prev" | "next") => {
      setIsLoading(true);
      try {
        const newWeek =
          direction === "prev"
            ? subWeeks(currentWeek, 1)
            : addWeeks(currentWeek, 1);
        setCurrentWeek(newWeek);

        const newWeekKey = format(
          startOfWeek(newWeek, { weekStartsOn: 1 }),
          "yyyy-MM-dd"
        );

        const isSoyeWeek = selectedWeeks.includes(newWeekKey);
        const newSelectedSalon = isSoyeWeek ? "Soye-en-Septaine" : "Flavigny";
        setSelectedSalon(newSelectedSalon);
        await fetchHoursForWeek(newSelectedSalon);
      } finally {
        setIsLoading(false);
      }
    },
    [currentWeek, selectedWeeks, fetchHoursForWeek]
  );

  const formatTimeTo24Hour = useCallback(
    (time: string | undefined | null): string => {
      if (!time) return "00:00";
      try {
        const [hours, minutes] = time.split(":").map(Number);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}`;
      } catch {
        return "00:00";
      }
    },
    []
  );

  const handleWeekToggle = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);
    const isChecked = event.target.checked;

    console.log("Salon sélectionné:", selectedSalon);
    console.log("Soye ouvert ?", isChecked);

    try {
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const dates = eachDayOfInterval({
        start,
        end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
      });
      const weekKey = format(start, "yyyy-MM-dd");

      const defaultTimeSlots = [{ startTime: "12:00", endTime: "14:00" }];

      await Promise.all(
        dates.map(async (date) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          const jour = format(date, "EEEE", { locale: fr }).toLowerCase();
          const isSunday = jour === "dimanche";

          // Log pour vérifier les données avant de les envoyer
          console.log(`Envoi des données pour ${jour} (${formattedDate})`);
          console.log("isClosed:", isChecked ? "Ouvert" : "Fermé");

          const soyeData = {
            salon: "Soye-en-Septaine",
            jour,
            date: formattedDate,
            isClosed: isSunday ? true : !isChecked,
            startTime: isSunday || !isChecked ? "" : "09:00",
            endTime: isSunday || !isChecked ? "" : "19:00",
            weekKey,
            timeSlots: isSunday || !isChecked ? [] : defaultTimeSlots, // Ne pas envoyer de créneaux si fermé
          };

          const flavignyData = {
            salon: "Flavigny",
            jour,
            date: formattedDate,
            isClosed: isSunday ? true : isChecked, // Utilise isChecked pour changer l'état de fermeture
            startTime: isSunday || isChecked ? "" : "09:00", // Si fermé, startTime vide
            endTime: isSunday || isChecked ? "" : "19:00", // Si fermé, endTime vide
            weekKey,
            timeSlots: isSunday || isChecked ? [] : defaultTimeSlots, // Ne pas envoyer de créneaux si fermé
          };

          console.log("Données envoyées pour Soye:", soyeData);
          console.log("Données envoyées pour Flavigny:", flavignyData);

          // Envoi des données de mise à jour
          const requests = [
            fetch("/api/opening-hours", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(soyeData),
            }),
            fetch("/api/opening-hours", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(flavignyData),
            }),
          ];

          const responses = await Promise.all(requests);
          responses.forEach((res, index) => {
            if (!res.ok) {
              console.error(
                `Erreur mise à jour ${index === 0 ? "Soye" : "Flavigny"}: ${
                  res.statusText
                }`
              );
              throw new Error(
                `Erreur mise à jour ${index === 0 ? "Soye" : "Flavigny"}: ${
                  res.statusText
                }`
              );
            }
          });
        })
      );

      setIsSoyeOpen(isChecked); // Met à jour l'état du salon en fonction de la case cochée
      const newSalon = isChecked ? "Soye-en-Septaine" : "Flavigny"; // Bascule entre les salons
      setSelectedSalon(newSalon);
      console.log("Salon après changement:", newSalon);

      await fetchHoursForWeek(newSalon); // Récupère les horaires pour le nouveau salon
    } catch (error) {
      console.error("Erreur lors de la bascule entre les salons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDayChanges = async () => {
    if (!editingDay) return;

    const dayHours = hours.find((h) => h.jour.toLowerCase() === editingDay);
    if (!dayHours) return;

    // Log pour vérifier les données envoyées à l'API
    console.log("Données envoyées à l'API:", {
      id: dayHours.id,
      salon: dayHours.salon,
      jour: dayHours.jour,
      date: dayHours.date,
      startTime: dayHours.startTime,
      endTime: dayHours.endTime,
      isClosed: dayHours.isClosed,
      timeSlots: dayHours.timeSlots,

      weekKey: format(
        startOfWeek(dayHours.date, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      ),
    });

    try {
      const response = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dayHours.id,
          salon: dayHours.salon,
          jour: dayHours.jour,
          date: dayHours.date,
          startTime: dayHours.startTime,
          endTime: dayHours.endTime,
          isClosed: dayHours.isClosed,
          timeSlots: dayHours.timeSlots,

          weekKey: format(
            startOfWeek(dayHours.date, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          ),
        }),
      });

      if (response.ok) {
        closeModal();
        setHours((prevHours) =>
          prevHours.map((h) =>
            h.jour.toLowerCase() === editingDay ? { ...h, ...dayHours } : h
          )
        );
        console.log("Heures après modification:", hours);
        await fetchHoursForWeek();
        console.log("Mise à jour réussie");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des horaires:", error);
    }
  };

  const closeModal = () => {
    setEditingDay(null);
    setEditingType(null);
  };

  return (
    <div className="p-4 md:p-6 min-h-[50vh] xl:min-h-[60vh]">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-green">
          Horaires d'Ouverture - {selectedSalon || ""}
        </h2>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 rounded-full"
            disabled={isLoading}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 bg-white text-green rounded-full" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-green md:hidden" />
            <span className="text-sm md:textgeneralHours-lg font-medium bg-white rounded-xl text-green p-2">
              Semaine du{" "}
              {format(
                startOfWeek(currentWeek, { weekStartsOn: 1 }),
                "dd/MM/yyyy"
              )}
            </span>
          </div>

          <button
            onClick={() => navigateWeek("next")}
            className="p-2 rounded-full"
            disabled={isLoading}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 bg-white text-green rounded-full" />
          </button>
        </div>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-lg shadow-md mb-6">
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
            className="text-xs md:text-sm font-medium text-green cursor-pointer"
          >
            Soye en Septaine est ouvert cette semaine
          </label>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {getCurrentWeekDays().map((day) => {
          const dayKey = `${
            day.formattedDate
          }-${selectedSalon}-${currentWeek.getTime()}`;
          const activeSalon = isSoyeOpen ? "Soye-en-Septaine" : "Flavigny";
          const dayHours = hours.find(
            (h) =>
              h.jour.toLowerCase() === day.dayName && h.salon === activeSalon
          );
          console.log("Heures pour le jour", day.dayName, dayHours);
          const isPast =
            isBefore(day.date, new Date()) && !isSameDay(day.date, new Date());

          return (
            <div
              key={dayKey}
              className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border rounded-lg ${
                isPast ? "bg-gray-100 text-gray-500" : "bg-white"
              }`}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="font-medium capitalize text-sm md:text-base">
                    {day.dayName}
                  </span>
                  <span className="text-xs md:text-sm text-gray-500">
                    {day.formattedDate}
                  </span>
                </div>

                {dayHours && !dayHours.isClosed && (
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <span className="text-green font-bold">
                      {formatTimeTo24Hour(dayHours.startTime)}{" "}
                      {/* Affichage de l'heure d'ouverture */}
                    </span>

                    {/* Affichage des créneaux de pause */}
                    {dayHours.timeSlots &&
                      dayHours.timeSlots.length > 0 &&
                      dayHours.timeSlots.map((timeSlot, index) => (
                        <div key={index}>
                          <span className="text-gray-600 mx-1">-</span>
                          <span className="text-green font-bold">
                            {formatTimeTo24Hour(timeSlot.startTime)}{" "}
                            {/* Affichage du créneau de pause */}
                          </span>
                          <span className="text-gray-600 mx-1">/</span>
                          <span className="text-green font-bold">
                            {formatTimeTo24Hour(timeSlot.endTime)}{" "}
                            {/* Affichage du créneau de pause */}
                          </span>
                        </div>
                      ))}

                    {/* Affichage de l'heure de fermeture */}
                    <span className="text-gray-600 mx-1">-</span>
                    <span className="text-green font-bold">
                      {formatTimeTo24Hour(dayHours.endTime)}{" "}
                      {/* Affichage de l'heure de fermeture */}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 md:mt-0 md:gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-1 text-xs md:text-sm rounded-full ${
                      dayHours?.isClosed ? "bg-gray-300" : "bg-green text-white"
                    }`}
                  >
                    {dayHours?.isClosed ? "Fermé" : "Ouvert"}
                  </div>
                  <span className="px-2 py-1 text-xs md:text-sm rounded-full bg-green text-white">
                    {activeSalon}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingDay(day.dayName);
                    setEditingType("day");
                  }}
                  className={`text-green underline text-xs md:text-sm ${
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
        <EditHoursModal
          editingDay={editingDay}
          getCurrentWeekDays={getCurrentWeekDays}
          hours={hours}
          setHours={setHours}
          closeModal={closeModal}
          saveDayChanges={saveDayChanges}
          selectedSalon={selectedSalon}
        />
      )}
    </div>
  );
}
