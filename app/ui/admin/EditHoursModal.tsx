import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TimeRange, OpeningHour, EditHoursModalProps } from "../../../lib/types";

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

  const [localStartTime, setLocalStartTime] = useState(currentHours?.startTime || "09:00");
  const [localEndTime, setLocalEndTime] = useState(currentHours?.endTime || "19:00");
  const [localTimeSlots, setLocalTimeSlots] = useState(
    currentHours?.timeSlots || [{ startTime: "12:00", endTime: "14:00" }]
  );
  const [isClosed, setIsClosed] = useState(currentHours?.isClosed || false);

  useEffect(() => {
    if (currentHours) {
      setLocalStartTime(currentHours.startTime || "09:00");
      setLocalEndTime(currentHours.endTime || "19:00");
      setLocalTimeSlots(
        currentHours.timeSlots.length > 0
          ? currentHours.timeSlots
          : [{ startTime: "12:00", endTime: "14:00" }]
      );
      setIsClosed(currentHours.isClosed || false);
    }
  }, [currentHours]);

  const updateStartTime = (value: string) => {
    setLocalStartTime(value);
  };

  const updateEndTime = (value: string) => {
    setLocalEndTime(value);
  };

  const removeTimeSlot = (index: number) => {
    const updatedTimeSlots = [...localTimeSlots];
    updatedTimeSlots.splice(index, 1);
    setLocalTimeSlots(updatedTimeSlots);
  };

  const updateTimeSlot = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updatedTimeSlots = [...localTimeSlots];
    updatedTimeSlots[index][field] = value;
    setLocalTimeSlots(updatedTimeSlots);
  };

  const handleSave = () => {
    if (selectedSalon) {
      const selectedDay = getCurrentWeekDays().find((d) => d.dayName === editingDay);
      if (selectedDay) {
        const updatedHours = {
          ...currentHours,
          startTime: isClosed ? "" : localStartTime,
          endTime: isClosed ? "" : localEndTime,
          timeSlots: isClosed
            ? []
            : localTimeSlots.length > 0
            ? localTimeSlots
            : [{ startTime: "12:00", endTime: "14:00" }], // Default time slot
          isClosed: isClosed,
        };
        saveDayChanges(selectedSalon, selectedDay.date, updatedHours);
        closeModal();
      }
    }
  };

  if (!editingDay) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b">
          <h3 className="text-lg md:text-xl font-semibold">
            Modification des horaires - {editingDay}
          </h3>
        </div>

        <div className="p-4 space-y-6">
          <div className="border p-4 rounded-lg">
            <h4 className="font-medium mb-3">Horaires d'ouverture</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Ouverture</label>
                <input
                  type="time"
                  value={localStartTime}
                  onChange={(e) => updateStartTime(e.target.value)}
                  className="w-full p-2 text-sm border rounded"
                  disabled={isClosed}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Fermeture</label>
                <input
                  type="time"
                  value={localEndTime}
                  onChange={(e) => updateEndTime(e.target.value)}
                  className="w-full p-2 text-sm border rounded"
                  disabled={isClosed}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Créneaux horaires</h4>
            <div className="space-y-4">
              {localTimeSlots.map((timeSlot, index) => (
                <div key={index} className="border p-3 rounded-lg relative">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h5 className="font-medium text-sm mb-3">Créneau {index + 1}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Début</label>
                      <input
                        type="time"
                        value={timeSlot.startTime}
                        onChange={(e) =>
                          updateTimeSlot(index, "startTime", e.target.value)
                        }
                        className="w-full p-2 text-sm border rounded"
                        disabled={isClosed}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Fin</label>
                      <input
                        type="time"
                        value={timeSlot.endTime}
                        onChange={(e) =>
                          updateTimeSlot(index, "endTime", e.target.value)
                        }
                        className="w-full p-2 text-sm border rounded"
                        disabled={isClosed}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() =>
                  setLocalTimeSlots([
                    ...localTimeSlots,
                    { startTime: "12:00", endTime: "14:00" },
                  ])
                }
                className="w-full py-2 px-4 text-sm text-green border-2 border-dashed border-green rounded-lg hover:bg-green-50"
                disabled={isClosed}
              >
                + Ajouter un créneau
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsClosed(!isClosed)}
            className={`w-full py-2 px-4 text-sm rounded-lg ${
              isClosed
                ? "bg-red text-white hover:bg-red-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isClosed ? "Réouvrir le salon" : "Fermer le salon"}
          </button>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3 justify-end">
          <button onClick={closeModal} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
            Annuler
          </button>
          <button
            onClick={handleSave}
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