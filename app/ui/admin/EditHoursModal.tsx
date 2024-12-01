import React, { useEffect } from "react";
import { X } from "lucide-react";
import {
  TimeRange,
  OpeningHour,
  EditHoursModalProps,
  WeekDay,
} from "../../../lib/types";

const EditHoursModal: React.FC<EditHoursModalProps> = ({
  editingDay,
  getCurrentWeekDays,
  hours,
  setHours,
  closeModal,
  saveDayChanges,
  selectedSalon,
}) => {
  const currentHours = hours.find(
    (h) => h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
  );

  // Fonction utilitaire pour convertir une heure en minutes
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const isTimeRangeValid = (range: TimeRange): boolean => {
    if (!range.startTime || !range.endTime) return false;
    return timeToMinutes(range.endTime) > timeToMinutes(range.startTime);
  };

  const formatFrenchTime = (time: string | undefined): string => {
    if (!time) return "";
    return time.replace(":", "h");
  };

  // Mise à jour des heures d'ouverture
  const updateStartTime = (value: string) => {
    const updatedStartTime = value || "09:00"; // Valeur par défaut en cas de valeur manquante
    setHours((prev) =>
      prev.map((h) =>
        h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
          ? { ...h, startTime: updatedStartTime }
          : h
      )
    );
  };

  // Mise à jour de l'heure de fermeture
  const updateEndTime = (value: string) => {
    const updatedEndTime = value || "19:00"; // Valeur par défaut en cas de valeur manquante
    setHours((prev) =>
      prev.map((h) =>
        h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
          ? { ...h, endTime: updatedEndTime }
          : h
      )
    );
  };

  const removeTimeSlot = (index: number) => {
    setHours((prev) =>
      prev.map((h) =>
        h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
          ? {
              ...h,
              timeSlots: (h.timeSlots || []).filter((_, i) => i !== index),
            }
          : h
      )
    );
  };

  const updateTimeSlot = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    if (!value) return;

    setHours((prev) =>
      prev.map((h) => {
        if (h.jour.toLowerCase() === editingDay && h.salon === selectedSalon) {
          const newTimeSlots = [...(h.timeSlots || [])];
          newTimeSlots[index] = {
            ...newTimeSlots[index],
            [field]: value,
          };

          return {
            ...h,
            timeSlots: newTimeSlots,
          };
        }
        return h;
      })
    );
  };

  // Initialisation des horaires si nécessaire
  useEffect(() => {
    if (!currentHours) return;
  
    // Vérifier si le salon n'est pas fermé et si les horaires sont définis
    if (
      !currentHours.isClosed &&
      (!currentHours.startTime || !currentHours.endTime)
    ) {
      setHours((prev) =>
        prev.map((h) => {
          if (
            h.jour.toLowerCase() === editingDay &&
            h.salon === selectedSalon
          ) {
            return {
              ...h,
              startTime: h.startTime || "09:00", // Valeur par défaut si absente
              endTime: h.endTime || "19:00", // Valeur par défaut si absente
              // Si il n'y a pas de créneaux existants, on initialise avec un seul créneau de 12:00 à 14:00
              timeSlots: h.timeSlots?.length
                ? h.timeSlots // Si des créneaux existent déjà, les conserver
                : [{ startTime: "12:00", endTime: "14:00" }], // Un seul créneau par défaut
            };
          }
          return h;
        })
      );
    }
  }, [editingDay, selectedSalon, currentHours, setHours]);
  
  
  

  if (!editingDay || !currentHours) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b">
          <h3 className="text-lg md:text-xl font-semibold">
            Modification des horaires - {editingDay}
          </h3>
          <div className="text-sm text-gray-600 mt-1">
            {
              getCurrentWeekDays().find((day) => day.dayName === editingDay)
                ?.formattedDate
            }
          </div>
        </div>

        <div className="p-4">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={currentHours?.isClosed || false}
              onChange={(e) =>
                setHours((prev) =>
                  prev.map((h) =>
                    h.jour.toLowerCase() === editingDay &&
                    h.salon === selectedSalon
                      ? {
                          ...h,
                          isClosed: e.target.checked,
                          timeSlots: [],
                        }
                      : h
                  )
                )
              }
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm">Fermé</span>
          </label>

          {!currentHours?.isClosed &&
            currentHours?.startTime &&
            currentHours?.endTime && (
              <div className="space-y-6">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Horaires d'ouverture</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">
                        Ouverture : {currentHours.startTime}
                      </label>
                      <input
                        type="time"
                        value={currentHours.startTime}
                        onChange={(e) => updateStartTime(e.target.value)}
                        className="w-full p-2 text-sm border rounded"
                        step="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Fermeture : {currentHours.endTime}
                      </label>
                      <input
                        type="time"
                        value={currentHours.endTime}
                        onChange={(e) => updateEndTime(e.target.value)}
                        className="w-full p-2 text-sm border rounded"
                        step="300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Créneaux horaires</h4>
                  <div className="space-y-4">
                    {(currentHours?.timeSlots || []).map((timeSlot, index) => (
                      <div key={index} className="border p-3 rounded-lg relative">
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <h5 className="font-medium text-sm mb-3">
                          Créneau {index + 1}
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-1">
                              Début : {timeSlot.startTime}
                            </label>
                            <input
                              type="time"
                              value={timeSlot.startTime}
                              onChange={(e) =>
                                updateTimeSlot(index, "startTime", e.target.value)
                              }
                              className="w-full p-2 text-sm border rounded"
                              step="300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">
                              Fin : {timeSlot.endTime}
                            </label>
                            <input
                              type="time"
                              value={timeSlot.endTime}
                              onChange={(e) =>
                                updateTimeSlot(index, "endTime", e.target.value)
                              }
                              className="w-full p-2 text-sm border rounded"
                              step="300"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setHours((prev) =>
                          prev.map((h) =>
                            h.jour.toLowerCase() === editingDay &&
                            h.salon === selectedSalon
                              ? {
                                  ...h,
                                  timeSlots: [
                                    ...(h.timeSlots || []),
                                    { startTime: "12:00", endTime: "14:00" },
                                  ],
                                }
                              : h
                          )
                        );
                      }}
                      className="w-full py-2 px-4 text-sm text-green border-2 border-dashed border-green rounded-lg hover:bg-green-50"
                    >
                      + Ajouter un créneau
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3 justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={saveDayChanges}
            className="px-4 py-2 text-sm bg-green text-white rounded hover:bg-green-600"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHoursModal;
