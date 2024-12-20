import { useState, useEffect, useCallback } from "react";
import {
  addWeeks,
  subWeeks,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Building2,
} from "lucide-react";
import { fr } from "date-fns/locale";
import EditHoursModal from "./EditHoursModal";
import type { OpeningHour } from "@/lib/types";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DailyHours {
  id?: string;
  salon: string;
  jour: string;
  date: string;
  isClosed: boolean;
  startTime: string;
  endTime: string;
  timeSlots: TimeSlot[];
}

interface OpeningHoursEditorProps {
  initialHours: OpeningHour[];
  salon: string;
}

interface DailySalonMap {
  [key: string]: string;
}

export default function OpeningHoursEditor({
  initialHours,
  salon,
}: OpeningHoursEditorProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [weekKey, setWeekKey] = useState<string>(
    format(currentWeek, "yyyy-MM-dd")
  );
  const [hours, setHours] = useState<OpeningHour[]>(initialHours);
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState<"day" | "week" | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [isSoyeOpen, setIsSoyeOpen] = useState<boolean>(false);

  const getCurrentWeekDays = useCallback(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map((date) => ({
      date,
      formattedDate: format(date, "dd/MM/yyyy"),
      dayName: format(date, "EEEE", { locale: fr }).toLowerCase(),
      weekKey: format(start, "yyyy-MM-dd"),
      isPast: date.getTime() < new Date().setHours(0, 0, 0, 0),
    }));
  }, [currentWeek]);

  const [dailySalon, setDailySalon] = useState<DailySalonMap>({});

  const fetchWeekHours = async () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const dates = eachDayOfInterval({ start, end }).map((date) =>
      format(date, "yyyy-MM-dd")
    );

    try {
      const [flavignyResponse, soyeResponse] = await Promise.all([
        fetch(`/api/opening-hours?salon=Flavigny&dates=${dates.join(",")}`),
        fetch(
          `/api/opening-hours?salon=Soye-en-Septaine&dates=${dates.join(",")}`
        ),
      ]);

      if (flavignyResponse.ok && soyeResponse.ok) {
        const flavignyData = await flavignyResponse.json();
        const soyeData = await soyeResponse.json();

        const allHours: OpeningHour[] = [];
        const updatedDailySalon: DailySalonMap = {};

        dates.forEach((date) => {
          const flavignyDay = flavignyData[date] || { isClosed: true };
          const soyeDay = soyeData[date] || { isClosed: true };

          // Ajouter les horaires de Flavigny
          allHours.push({
            id: flavignyDay.id || `${date}-flavigny`,
            salon: "Flavigny",
            jour: format(new Date(date), "EEEE", { locale: fr }).toLowerCase(),
            date: new Date(date),
            startTime: flavignyDay.startTime || "09:00",
            endTime: flavignyDay.endTime || "19:00",
            isClosed: flavignyDay.isClosed,
            timeSlots: flavignyDay.timeSlots || [],
          });

          // Ajouter les horaires de Soye-en-Septaine
          allHours.push({
            id: soyeDay.id || `${date}-soye`,
            salon: "Soye-en-Septaine",
            jour: format(new Date(date), "EEEE", { locale: fr }).toLowerCase(),
            date: new Date(date),
            startTime: soyeDay.startTime || "09:00",
            endTime: soyeDay.endTime || "19:00",
            isClosed: soyeDay.isClosed,
            timeSlots: soyeDay.timeSlots || [],
          });

          // Mettre à jour dailySalon en fonction de l'état ouvert/fermé
          if (!flavignyDay.isClosed) {
            updatedDailySalon[date] = "Flavigny";
          } else if (!soyeDay.isClosed) {
            updatedDailySalon[date] = "Soye-en-Septaine";
          } else {
            updatedDailySalon[date] = "Fermé";
          }
        });

        console.log("Horaires récupérés après mise à jour :", allHours);
        console.log("Mise à jour de dailySalon :", updatedDailySalon);

        setHours(allHours);
        setDailySalon(updatedDailySalon); // Synchroniser dailySalon
      } else {
        console.error(
          "Erreur dans la réponse des API:",
          await flavignyResponse.text(),
          await soyeResponse.text()
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des horaires:", error);
    }
  };

  useEffect(() => {
    console.log(
      "Fetching week hours for week:",
      format(currentWeek, "yyyy-MM-dd")
    );
    fetchWeekHours();
  }, [currentWeek]);

  const saveDayChanges = async (
    selectedDaySalon?: string,
    date?: Date,
    updatedHours?: Partial<OpeningHour>
  ) => {
    if (!editingDay) return;

    const dayHours = hours.find((h) => h.jour.toLowerCase() === editingDay);
    if (!dayHours) return;

    const newSalon = selectedDaySalon || dayHours.salon;
    const dateStr = format(date || dayHours.date, "yyyy-MM-dd");

    const defaultStartTime = "09:00";
    const defaultEndTime = "19:00";
    const defaultTimeSlots = [
      { startTime: "12:00", endTime: "14:00", isAvailable: true },
    ];

    try {
      console.log("Mise à jour des horaires:", {
        salon: newSalon,
        date: dateStr,
        startTime: updatedHours?.startTime,
        endTime: updatedHours?.endTime,
        timeSlots: updatedHours?.timeSlots,
      });

      const response = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dayHours.id,
          salon: newSalon,
          jour: dayHours.jour,
          date: dateStr,
          startTime: updatedHours?.startTime || defaultStartTime,
          endTime: updatedHours?.endTime || defaultEndTime,
          isClosed: updatedHours?.isClosed ?? false,
          timeSlots: updatedHours?.timeSlots || defaultTimeSlots,
          weekKey: format(
            startOfWeek(new Date(dateStr), { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          ),
        }),
      });

      if (response.ok) {
        const updatedDay = await response.json();
        console.log("Horaires mis à jour:", updatedDay);

        setHours((prevHours) =>
          prevHours.map((hour) =>
            hour.id === updatedDay.id
              ? {
                  ...hour,
                  startTime: updatedHours?.startTime || hour.startTime,
                  endTime: updatedHours?.endTime || hour.endTime,
                  timeSlots: updatedHours?.timeSlots || hour.timeSlots,
                  isClosed: updatedHours?.isClosed ?? hour.isClosed,
                }
              : hour
          )
        );

        // Mettre à jour l'autre salon comme fermé
        const otherSalon =
          newSalon === "Flavigny" ? "Soye-en-Septaine" : "Flavigny";
        const closeOtherSalon = await fetch("/api/opening-hours", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salon: otherSalon,
            jour: dayHours.jour,
            date: dateStr,
            isClosed: true,
            startTime: "",
            endTime: "",
            timeSlots: [],
            weekKey: format(
              startOfWeek(new Date(dateStr), { weekStartsOn: 1 }),
              "yyyy-MM-dd"
            ),
          }),
        });

        if (!closeOtherSalon.ok) {
          console.error(
            "Erreur lors de la mise à jour du salon fermé:",
            await closeOtherSalon.text()
          );
        }

        // Mettre à jour dailySalon
        setDailySalon((prev) => ({
          ...prev,
          [dateStr]: newSalon,
        }));

        // Recharger les horaires
        await fetchWeekHours();
      } else {
        console.error(
          "Erreur lors de la mise à jour des horaires:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des horaires:", error);
    }
  };

  const toggleSalon = async (date: Date, currentSalon: string) => {
    const newSalon =
      currentSalon === "Flavigny" ? "Soye-en-Septaine" : "Flavigny";
    const dateStr = format(date, "yyyy-MM-dd");

    // Mise à jour du salon actif dans dailySalon
    setDailySalon((prev) => ({
      ...prev,
      [dateStr]: newSalon,
    }));

    // Trouver les entrées horaires pour les deux salons
    const currentDayHours = hours.find(
      (h) =>
        format(new Date(h.date), "yyyy-MM-dd") === dateStr &&
        h.salon === currentSalon
    );

    const newDayHours = hours.find(
      (h) =>
        format(new Date(h.date), "yyyy-MM-dd") === dateStr &&
        h.salon === newSalon
    );

    if (!currentDayHours || !newDayHours) {
      console.error("Aucun horaire trouvé pour l'un des salons spécifiés.");
      return;
    }

    try {
      // Mettre à jour l'ancien salon pour le marquer comme fermé
      const updatedCurrentDayHours = {
        ...currentDayHours,
        isClosed: true,
        startTime: "",
        endTime: "",
        timeSlots: [],
      };

      const responseCurrent = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedCurrentDayHours,
          weekKey: format(
            startOfWeek(new Date(updatedCurrentDayHours.date), {
              weekStartsOn: 1,
            }),
            "yyyy-MM-dd"
          ),
        }),
      });

      if (!responseCurrent.ok) {
        console.error(
          "Erreur lors de la mise à jour du salon actuel:",
          await responseCurrent.text()
        );
        return;
      }

      // Mettre à jour le nouveau salon pour le marquer comme ouvert
      const updatedNewDayHours = {
        ...newDayHours,
        isClosed: false,
        startTime: newDayHours.startTime || "09:00",
        endTime: newDayHours.endTime || "19:00",
        timeSlots: newDayHours.timeSlots.length
          ? newDayHours.timeSlots
          : [{ startTime: "12:00", endTime: "14:00", isAvailable: true }],
      };

      const responseNew = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedNewDayHours,
          weekKey: format(
            startOfWeek(new Date(updatedNewDayHours.date), { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          ),
        }),
      });

      if (!responseNew.ok) {
        console.error(
          "Erreur lors de la mise à jour du nouveau salon:",
          await responseNew.text()
        );
        return;
      }

      // Mettre à jour l'état local pour refléter les modifications
      setHours((prevHours) =>
        prevHours.map((hour) => {
          if (hour.id === updatedCurrentDayHours.id) {
            return updatedCurrentDayHours;
          }
          if (hour.id === updatedNewDayHours.id) {
            return updatedNewDayHours;
          }
          return hour;
        })
      );

      console.log("Basculement du salon effectué avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des salons :", error);
    }
  };

  const navigateWeek = useCallback(
    (direction: "prev" | "next") => {
      const newWeek =
        direction === "prev"
          ? subWeeks(currentWeek, 1)
          : addWeeks(currentWeek, 1);
      console.log("Navigating to week:", format(newWeek, "yyyy-MM-dd"));
      setCurrentWeek(newWeek);
    },
    [currentWeek]
  );

  return (
    <div className="p-4 md:p-6 min-h-[50vh] xl:min-h-[60vh]">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-green">
          Horaires d'Ouverture
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

      <div className="space-y-3 md:space-y-4">
        {getCurrentWeekDays().map((day) => {
          const dayKey = format(day.date, "yyyy-MM-dd");
          const currentSalon = dailySalon[dayKey] || "Flavigny";

          // Recherche des horaires avec plus de logs
          console.log("Recherche pour:", dayKey, currentSalon);
          const dayHours = hours.find(
            (h) =>
              format(new Date(h.date), "yyyy-MM-dd") === dayKey &&
              h.salon === currentSalon
          );
          console.log("Horaires trouvés:", dayHours);

          const isClosed = dayHours?.isClosed ?? true; // Par défaut fermé si pas d'horaires

          return (
            <div
              key={dayKey}
              className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border rounded-lg ${
                isClosed || day.isPast
                  ? "bg-gray-200 text-gray-500"
                  : "bg-white"
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

                {isClosed ? (
                  <div className="text-gray-500 text-sm">Fermé</div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    {/* Start Time */}
                    <span className="text-green font-bold">
                      {dayHours?.startTime || "09:00"}
                    </span>

                    {/* Time Slots */}
                    {dayHours &&
                      dayHours.timeSlots &&
                      dayHours.timeSlots.length > 0 && (
                        <>
                          <span className="text-gray-600 mx-1">|</span>
                          {dayHours.timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <span className="text-gray-700">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {index < dayHours.timeSlots.length - 1 && (
                                <span className="text-gray-400">|</span>
                              )}
                            </div>
                          ))}
                        </>
                      )}

                    {/* End Time */}
                    {dayHours?.endTime && (
                      <>
                        <span className="text-gray-600 mx-1">|</span>
                        <span className="text-green font-bold">
                          {dayHours.endTime || "19:00"}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 md:mt-0 md:gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSalon(day.date, currentSalon)}
                    className="flex items-center gap-2 px-3 py-1 text-xs md:text-sm rounded-full bg-green text-white"
                  >
                    <Building2 className="w-4 h-4" />
                    {currentSalon}
                  </button>
                </div>

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

      {editingType === "day" &&
        editingDay &&
        (() => {
          const selectedDayObj = getCurrentWeekDays().find(
            (d) => d.dayName === editingDay
          );
          const selectedDayDate = selectedDayObj?.date || new Date();
          const dayKey = format(selectedDayDate, "yyyy-MM-dd");
          const computedSalon = dailySalon[dayKey];
          const chosenSalon =
            computedSalon === "Fermé" ? "Flavigny" : computedSalon;

          return (
            <EditHoursModal
              editingDay={editingDay}
              getCurrentWeekDays={getCurrentWeekDays}
              hours={hours}
              setHours={setHours}
              closeModal={() => {
                setEditingDay(null);
                setEditingType(null);
              }}
              saveDayChanges={saveDayChanges}
              selectedSalon={chosenSalon}
            />
          );
        })()}
    </div>
  );
}
