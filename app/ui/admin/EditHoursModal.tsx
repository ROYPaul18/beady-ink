'use client';

import React, { useEffect } from "react";
import { X } from "lucide-react";
import {
  TimeRange,
  OpeningHour,
  EditHoursModalProps,
  WeekDay
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

  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const isTimeRangeValid = (range: TimeRange): boolean => {
    if (!range.startTime || !range.endTime) return false;
    return timeToMinutes(range.endTime) > timeToMinutes(range.startTime);
  };

  const formatFrenchTime = (time: string | undefined): string => {
    if (!time) return '';
    return time.replace(':', 'h');
  };

  const areBreaksValid = (breaks: TimeRange[], generalHours: TimeRange): boolean => {
    if (!breaks || !generalHours) return false;
    
    console.log("Validating breaks:", { breaks, generalHours });
    const generalStart = timeToMinutes(generalHours.startTime);
    const generalEnd = timeToMinutes(generalHours.endTime);

    const sortedBreaks = [...breaks].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    for (let i = 0; i < sortedBreaks.length; i++) {
      const breakStart = timeToMinutes(sortedBreaks[i].startTime);
      const breakEnd = timeToMinutes(sortedBreaks[i].endTime);

      if (breakStart < generalStart || breakEnd > generalEnd) {
        console.log("Pause en dehors des horaires d'ouverture");
        return false;
      }

      if (breakEnd <= breakStart) {
        console.log("Heure de fin avant ou égale à l'heure de début");
        return false;
      }

      if (i < sortedBreaks.length - 1) {
        const nextBreakStart = timeToMinutes(sortedBreaks[i + 1].startTime);
        if (breakEnd > nextBreakStart) {
          console.log("Chevauchement avec la pause suivante");
          return false;
        }
      }
    }

    return true;
  };

  const updateGeneralHours = (field: "startTime" | "endTime", value: string) => {
    if (!value) return;
    
    console.log("Updating general hours:", { field, value });
    setHours((prev) =>
      prev.map((h) => {
        if (h.jour.toLowerCase() === editingDay && h.salon === selectedSalon) {
          const newGeneralHours = {
            ...h.generalHours,
            [field]: value
          };

          if (!isTimeRangeValid(newGeneralHours)) {
            alert("L'heure de fermeture doit être après l'heure d'ouverture");
            return h;
          }

          const validBreaks = (h.breaks || []).filter(breakRange => 
            timeToMinutes(breakRange.startTime) >= timeToMinutes(newGeneralHours.startTime) &&
            timeToMinutes(breakRange.endTime) <= timeToMinutes(newGeneralHours.endTime)
          );

          return {
            ...h,
            generalHours: newGeneralHours,
            breaks: validBreaks
          };
        }
        return h;
      })
    );
  };

  const addBreak = () => {
    if (!currentHours?.generalHours?.startTime) return;

    setHours((prev) =>
      prev.map((h) => {
        if (h.jour.toLowerCase() === editingDay && h.salon === selectedSalon) {
          const startTime = h.generalHours?.startTime || "09:00";
          return {
            ...h,
            breaks: [...(h.breaks || []), {
              startTime,
              endTime: startTime
            }]
          };
        }
        return h;
      })
    );
  };

  const removeBreak = (index: number) => {
    setHours((prev) =>
      prev.map((h) =>
        h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
          ? {
              ...h,
              breaks: (h.breaks || []).filter((_, i) => i !== index)
            }
          : h
      )
    );
  };

  const updateBreak = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    if (!value) return;
    
    console.log("Updating break:", { index, field, value });
    
    setHours((prev) =>
      prev.map((h) => {
        if (h.jour.toLowerCase() === editingDay && h.salon === selectedSalon) {
          const newBreaks = [...(h.breaks || [])];
          newBreaks[index] = {
            ...newBreaks[index],
            [field]: value
          };

          console.log("New breaks after update:", newBreaks);

          if (!areBreaksValid(newBreaks, h.generalHours)) {
            alert("Cette plage horaire n'est pas valide (chevauchement ou hors horaires d'ouverture)");
            return h;
          }

          return {
            ...h,
            breaks: newBreaks
          };
        }
        return h;
      })
    );
  };

  useEffect(() => {
    if (!currentHours?.isClosed && (!currentHours?.generalHours || !currentHours?.breaks)) {
      setHours((prev) =>
        prev.map((h) =>
          h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
            ? {
                ...h,
                generalHours: h.generalHours || { startTime: "09:00", endTime: "19:00" },
                breaks: h.breaks || [{ startTime: "12:00", endTime: "14:00" }]
              }
            : h
          )
      );
    }
  }, [editingDay, selectedSalon, currentHours]);

  if (!editingDay || !currentHours) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b">
          <h3 className="text-lg md:text-xl font-semibold">
            Modification des horaires - {editingDay}
          </h3>
          <div className="text-sm text-gray-600 mt-1">
            {getCurrentWeekDays().find((day) => day.dayName === editingDay)?.formattedDate}
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
                    h.jour.toLowerCase() === editingDay && h.salon === selectedSalon
                      ? { 
                          ...h, 
                          isClosed: e.target.checked, 
                          breaks: [] 
                        }
                      : h
                  )
                )
              }
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm">Fermé</span>
          </label>

          {!currentHours?.isClosed && currentHours?.generalHours && (
            <div className="space-y-6">
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-3">Horaires d'ouverture</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">
                      Ouverture : {formatFrenchTime(currentHours.generalHours.startTime)}
                    </label>
                    <input
                      type="time"
                      value={currentHours.generalHours.startTime}
                      onChange={(e) => updateGeneralHours("startTime", e.target.value)}
                      className="w-full p-2 text-sm border rounded"
                      step="300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Fermeture : {formatFrenchTime(currentHours.generalHours.endTime)}
                    </label>
                    <input
                      type="time"
                      value={currentHours.generalHours.endTime}
                      onChange={(e) => updateGeneralHours("endTime", e.target.value)}
                      className="w-full p-2 text-sm border rounded"
                      step="300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Pauses</h4>
                <div className="space-y-4">
                  {(currentHours?.breaks || []).map((breakRange, index) => (
                    <div
                      key={index}
                      className="border p-3 rounded-lg relative"
                    >
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => removeBreak(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <h5 className="font-medium text-sm mb-3">
                        Pause {index + 1}
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">
                            Début : {formatFrenchTime(breakRange.startTime)}
                          </label>
                          <input
                            type="time"
                            value={breakRange.startTime}
                            onChange={(e) => updateBreak(index, "startTime", e.target.value)}
                            className="w-full p-2 text-sm border rounded"
                            step="300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">
                            Fin : {formatFrenchTime(breakRange.endTime)}
                          </label>
                          <input
                            type="time"
                            value={breakRange.endTime}
                            onChange={(e) => updateBreak(index, "endTime", e.target.value)}
                            className="w-full p-2 text-sm border rounded"
                            step="300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addBreak}
                    className="w-full py-2 px-4 text-sm text-green border-2 border-dashed border-green rounded-lg hover:bg-green-50"
                  >
                    + Ajouter une pause
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