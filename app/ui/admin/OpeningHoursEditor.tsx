"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  const initialSalonForWeek = useMemo(() => {
    return isSoyeOpen ? "Soye-en-Septaine" : "Flavigny";
  }, [isSoyeOpen]);
  const [hoursByDay, setHoursByDay] = useState<{
    [date: string]: {
      salon: string;
      isClosed: boolean;
      startTime: string;
      endTime: string;
    };
  }>({});

  // Nouveau state pour gérer les salons journaliers
  const [dailySalonOverrides, setDailySalonOverrides] = useState<{
    [date: string]: string;
  }>({});

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
        const data = await response.json();

        // Vérifie uniquement les jours par défaut (sans overrides)
        const isDefaultSoyeOpen = dates.some((date) => {
          const dayData = data[date];
          return (
            dayData && !dayData.isClosed // Ouvert
          );
        });

        // Met à jour uniquement si les jours par défaut indiquent une semaine Soye
        if (isDefaultSoyeOpen !== isSoyeOpen) {
          setIsSoyeOpen(isDefaultSoyeOpen);
        }

        return isDefaultSoyeOpen;
      }

      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification de Soye :", error);
      return false;
    }
  }, [currentWeek, isSoyeOpen]);

  const fetchHoursForWeek = useCallback(
    async (salonToFetch?: string) => {
      const activeSalon = salonToFetch || selectedSalon;
      if (!activeSalon) return;
      try {
        const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
        const dates = eachDayOfInterval({ start, end }).map((date) =>
          format(date, "yyyy-MM-dd")
        );

        // Récupérer les données pour les deux salons
        const [flavignyResponse, soyeResponse] = await Promise.all([
          fetch(`/api/opening-hours?salon=Flavigny&dates=${dates.join(",")}`),
          fetch(
            `/api/opening-hours?salon=Soye-en-Septaine&dates=${dates.join(",")}`
          ),
        ]);

        if (flavignyResponse.ok && soyeResponse.ok) {
          const flavignyData = await flavignyResponse.json();
          const soyeData = await soyeResponse.json();

          setHours(() =>
            dates.map((date) => {
              const currentDate = new Date(date);
              const dayName = format(currentDate, "EEEE", {
                locale: fr,
              }).toLowerCase();

              // Vérification : Priorité aux exceptions (overrides journaliers)
              const overrideSalon = dailySalonOverrides[date];
              let dayData;

              if (overrideSalon) {
                dayData =
                  overrideSalon === "Soye-en-Septaine"
                    ? soyeData[date]
                    : flavignyData[date];
              } else {
                // Sinon, déterminer en fonction du salon global de la semaine
                const defaultSalon = isSoyeOpen
                  ? "Soye-en-Septaine"
                  : "Flavigny";
                dayData =
                  defaultSalon === "Soye-en-Septaine"
                    ? soyeData[date]
                    : flavignyData[date];
              }

              // Retourner les horaires avec priorité aux overrides journaliers
              return {
                id: dayData?.id || null,
                date: currentDate,
                jour: dayName,
                salon:
                  overrideSalon ||
                  (isSoyeOpen ? "Soye-en-Septaine" : "Flavigny"),
                isClosed: dayData?.isClosed || false,
                startTime: dayData?.startTime || "09:00",
                endTime: dayData?.endTime || "19:00",
                timeSlots: dayData?.timeSlots || [],
              };
            })
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des horaires :", error);
      }
    },
    [currentWeek, selectedSalon, dailySalonOverrides, isSoyeOpen]
  );

  const loadDailyOverrides = useCallback(async () => {
    if (!Object.keys(dailySalonOverrides).length) return;

    setIsLoading(true);
    try {
      for (const [dateStr, overrideSalon] of Object.entries(
        dailySalonOverrides
      )) {
        const response = await fetch(
          `/api/opening-hours?salon=${overrideSalon}&dates=${dateStr}`
        );
        if (response.ok) {
          const data = await response.json();
          const dayData = data[dateStr];
          if (dayData) {
            setHours((prev) =>
              prev.map((h) => {
                if (format(h.date, "yyyy-MM-dd") === dateStr) {
                  return {
                    ...h,
                    salon: overrideSalon,
                    isClosed: dayData.isClosed,
                    startTime: dayData.startTime || "09:00",
                    endTime: dayData.endTime || "19:00",
                    timeSlots: dayData.timeSlots || [],
                  };
                }
                return h;
              })
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des overrides journaliers :",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [dailySalonOverrides]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (isLoading) return;

        setIsLoading(true);

        if (!selectedWeeks.length) {
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

          if (!hours.some((h) => h.salon === initialSalon)) {
            await fetchHoursForWeek(initialSalon);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [getCurrentWeekKey, selectedWeeks]);

  useEffect(() => {
    if (selectedSalon && !isLoading) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const isOpen = await checkIfSoyeIsOpen();
          if (isOpen !== isSoyeOpen) {
            await fetchHoursForWeek(selectedSalon);
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedSalon, isSoyeOpen, fetchHoursForWeek, checkIfSoyeIsOpen]);

  useEffect(() => {
    if (selectedSalon) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const isOpen = await checkIfSoyeIsOpen();
          const shouldBeSoye = isOpen && selectedSalon !== "Soye-en-Septaine";
          const shouldBeFlavigny = !isOpen && selectedSalon !== "Flavigny";

          if (shouldBeSoye || shouldBeFlavigny) {
            const newSalon = isOpen ? "Soye-en-Septaine" : "Flavigny";
            setSelectedSalon(newSalon);
            await fetchHoursForWeek(newSalon);
          } else {
            await fetchHoursForWeek(selectedSalon);
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedSalon, checkIfSoyeIsOpen, fetchHoursForWeek]);

  // Charge les overrides quotidiens après le fetch principal
  useEffect(() => {
    loadDailyOverrides();
  }, [dailySalonOverrides, loadDailyOverrides]);

  useEffect(() => {
    // Sauvegarder les overrides dans localStorage quand ils changent
    if (Object.keys(dailySalonOverrides).length > 0) {
      localStorage.setItem(
        "dailySalonOverrides",
        JSON.stringify(dailySalonOverrides)
      );
    }
  }, [dailySalonOverrides]);

  useEffect(() => {
    const savedOverrides = localStorage.getItem("dailySalonOverrides");
    if (savedOverrides) {
      try {
        const parsedOverrides = JSON.parse(savedOverrides);
        setDailySalonOverrides(parsedOverrides);
        console.log("Overrides rechargés :", parsedOverrides);
      } catch (error) {
        console.error("Erreur lors du parsing des overrides :", error);
      }
    }
  }, []);

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
        // Calculer la nouvelle semaine
        const newWeek =
          direction === "prev"
            ? subWeeks(currentWeek, 1)
            : addWeeks(currentWeek, 1);

        setCurrentWeek(newWeek);

        const newWeekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const newWeekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });

        console.log("Navigation semaine : ", {
          direction,
          newWeekStart: format(newWeekStart, "yyyy-MM-dd"),
          newWeekEnd: format(newWeekEnd, "yyyy-MM-dd"),
        });

        // Vérifier si la nouvelle semaine est une semaine Soye ou Flavigny
        const newWeekKey = format(newWeekStart, "yyyy-MM-dd");
        const isSoyeWeek = selectedWeeks.includes(newWeekKey);
        const newSelectedSalon = isSoyeWeek ? "Soye-en-Septaine" : "Flavigny";

        console.log("Semaine détectée : ", {
          newWeekKey,
          isSoyeWeek,
          newSelectedSalon,
        });

        setSelectedSalon(newSelectedSalon);

        // Charger uniquement les overrides pour la nouvelle semaine
        const overridesForNewWeek = Object.fromEntries(
          Object.entries(dailySalonOverrides).filter(([dateStr]) => {
            const date = new Date(dateStr);
            return date >= newWeekStart && date <= newWeekEnd;
          })
        );

        console.log(
          "Overrides pour la nouvelle semaine : ",
          overridesForNewWeek
        );

        // Conserver les overrides existants en excluant ceux hors de la nouvelle semaine
        setDailySalonOverrides((prev) => ({
          ...Object.fromEntries(
            Object.entries(prev).filter(([dateStr]) => {
              const date = new Date(dateStr);
              return date < newWeekStart || date > newWeekEnd;
            })
          ),
          ...overridesForNewWeek,
        }));

        // Recharger les horaires pour la nouvelle semaine
        await fetchHoursForWeek(newSelectedSalon);

        // Recalibrer isSoyeOpen en fonction des horaires par défaut
        await checkIfSoyeIsOpen();
      } catch (error) {
        console.error(
          "Erreur lors de la navigation entre les semaines :",
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentWeek,
      selectedWeeks,
      dailySalonOverrides,
      fetchHoursForWeek,
      checkIfSoyeIsOpen,
    ]
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
    const isChecked = event.target.checked;

    // Modifier uniquement l'état global de la semaine
    if (isSoyeOpen === isChecked) return;

    setIsLoading(true);

    try {
      // Logique pour basculer entre les semaines de Soye et Flavigny
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

          const soyeData = {
            salon: "Soye-en-Septaine",
            jour,
            date: formattedDate,
            isClosed: isSunday ? true : !isChecked,
            startTime: isSunday || !isChecked ? "" : "09:00",
            endTime: isSunday || !isChecked ? "" : "19:00",
            weekKey,
            timeSlots: isSunday || !isChecked ? [] : defaultTimeSlots,
          };

          const flavignyData = {
            salon: "Flavigny",
            jour,
            date: formattedDate,
            isClosed: isSunday ? true : isChecked,
            startTime: isSunday || isChecked ? "" : "09:00",
            endTime: isSunday || isChecked ? "" : "19:00",
            weekKey,
            timeSlots: isSunday || isChecked ? [] : defaultTimeSlots,
          };

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

      const newSalon = isChecked ? "Soye-en-Septaine" : "Flavigny";
      setSelectedSalon(newSalon);

      // Réinitialiser les overrides journaliers car on vient de tout recalculer
      setDailySalonOverrides({});
      await fetchHoursForWeek(newSalon);
      setIsSoyeOpen(isChecked);
    } catch (error) {
      console.error("Erreur lors de la bascule entre les salons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDayChanges = async (selectedDaySalon?: string) => {
    if (!editingDay) return;

    const dayHours = hours.find((h) => h.jour.toLowerCase() === editingDay);
    if (!dayHours) return;

    const newSalon = selectedDaySalon || dayHours.salon;
    const dateStr = format(dayHours.date, "yyyy-MM-dd");
    const defaultSalon = isSoyeOpen ? "Soye-en-Septaine" : "Flavigny";
    const otherSalon =
      newSalon === "Soye-en-Septaine" ? "Flavigny" : "Soye-en-Septaine";

    try {
      const response = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dayHours.id,
          salon: newSalon,
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

      const closeOtherSalon = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salon: otherSalon,
          jour: dayHours.jour,
          date: dayHours.date,
          isClosed: true,
          startTime: "",
          endTime: "",
          timeSlots: [],
          weekKey: format(
            startOfWeek(dayHours.date, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          ),
        }),
      });

      if (response.ok && closeOtherSalon.ok) {
        // Recharger les horaires pour la semaine courante
        await fetchHoursForWeek();

        // Mettre à jour les overrides
        setDailySalonOverrides((prev) => ({
          ...prev,
          [dateStr]: newSalon,
        }));

        closeModal();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des horaires :", error);
    }
  };

  const closeModal = () => {
    setEditingDay(null);
    setEditingType(null);
  };

  const activeSalonForWeek = isSoyeOpen ? "Soye-en-Septaine" : "Flavigny";

  const getSalonForDay = (
    date: Date
  ): { salon: string | null; isClosed: boolean } => {
    const dayKey = format(date, "yyyy-MM-dd");

    // 1. Priorité aux overrides journaliers
    const overrideSalon = dailySalonOverrides[dayKey];
    if (overrideSalon) {
      const overrideHours = hours.find(
        (h) =>
          format(new Date(h.date), "yyyy-MM-dd") === dayKey &&
          h.salon === overrideSalon
      );
      return {
        salon: overrideHours?.salon || null,
        isClosed: overrideHours?.isClosed ?? true,
      };
    }

    // 2. Sinon, utilise les données du salon par défaut de la semaine
    const defaultSalon = selectedWeeks.includes(getCurrentWeekKey())
      ? "Soye-en-Septaine"
      : "Flavigny";

    const defaultHours = hours.find(
      (h) =>
        format(new Date(h.date), "yyyy-MM-dd") === dayKey &&
        h.salon === defaultSalon
    );

    return {
      salon: defaultHours?.salon || null,
      isClosed: defaultHours?.isClosed ?? true,
    };
  };

  const daySalonToEdit = useMemo(() => {
    if (!editingDay) return selectedSalon;
    const currentWeekDays = getCurrentWeekDays();
    const day = currentWeekDays.find((d) => d.dayName === editingDay);
    if (!day) return selectedSalon;
    const dayKey = format(day.date, "yyyy-MM-dd");
    return (
      dailySalonOverrides[dayKey] ||
      (isSoyeOpen ? "Soye-en-Septaine" : "Flavigny")
    );
  }, [
    editingDay,
    getCurrentWeekDays,
    dailySalonOverrides,
    isSoyeOpen,
    selectedSalon,
  ]);

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
            <span className="text-sm md:text-lg font-medium bg-white rounded-xl text-green p-2">
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
          const dayKey = format(day.date, "yyyy-MM-dd");

          // Vérifier s'il y a un override pour ce jour
          const overrideSalon = dailySalonOverrides[dayKey];

          // Déterminer quel salon afficher : priorité à l'override, sinon état global
          const displaySalon =
            overrideSalon || (isSoyeOpen ? "Soye-en-Septaine" : "Flavigny");

          // Trouver les horaires pour le salon à afficher
          const activeHours = hours.find(
            (h) =>
              format(h.date, "yyyy-MM-dd") === dayKey &&
              h.salon === displaySalon
          );

          // Déterminer si le jour est fermé
          const isClosed = activeHours?.isClosed ?? true;

          // Vérifiez si la date est passée
          const isPast =
            isBefore(day.date, new Date()) && !isSameDay(day.date, new Date());

          return (
            <div
              key={dayKey}
              className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border rounded-lg ${
                isPast ? "bg-gray-100 text-gray-500" : "bg-white"
              }`}
            >
              {/* Informations sur le jour */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="font-medium capitalize text-sm md:text-base">
                    {day.dayName}
                  </span>
                  <span className="text-xs md:text-sm text-gray-500">
                    {day.formattedDate}
                  </span>
                </div>

                {/* Affichage des horaires ou Fermé */}
                {isClosed ? (
                  <div className="text-gray-500 text-sm">Fermé</div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <span className="text-green font-bold">
                      {activeHours?.startTime || "09:00"}
                    </span>
                    <span className="text-gray-600 mx-1">-</span>
                    <span className="text-green font-bold">
                      {activeHours?.endTime || "19:00"}
                    </span>
                  </div>
                )}
              </div>

              {/* Statut ouvert/fermé et salon */}
              <div className="flex items-center justify-between mt-3 md:mt-0 md:gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-1 text-xs md:text-sm rounded-full ${
                      isClosed ? "bg-gray-300" : "bg-green text-white"
                    }`}
                  >
                    {isClosed ? "Fermé" : "Ouvert"}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs md:text-sm rounded-full ${
                      displaySalon ? "bg-green text-white" : "bg-gray-300"
                    }`}
                  >
                    {displaySalon || "Aucun salon"}
                  </span>
                </div>

                {/* Bouton Modifier */}
                <button
                  onClick={() => {
                    setEditingDay(day.dayName);
                    setEditingType("day");
                  }}
                  className="text-green underline text-xs md:text-sm"
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

