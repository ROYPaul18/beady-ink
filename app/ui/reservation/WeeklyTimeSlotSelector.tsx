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
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
interface DayInfo {
  id?: number;
  salon: string; // Ajout du champ salon
  isClosed: boolean;
  startTime: string;
  endTime: string;
  timeSlots?: { startTime: string; endTime: string }[];
}
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

interface Booking {
  date: string;
  startTime: string;
  duration: number;
  endTime?: string;
}
interface Reservation {
  date: string;
  time: string;
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
  console.log("Prop salon reçue:", salon);
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
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  const getAlternateSalon = (currentSalon: string) => {
    return currentSalon === "Soye-en-Septaine"
      ? "Flavigny"
      : "Soye-en-Septaine";
  };

  // Cette fonction récupère les réservations existantes dans la base de données.
  const fetchExistingBookings = async (
    targetSalon: string,
    dates: string[]
  ): Promise<Booking[]> => {
    try {
      // L'URL de l'API peut être ajustée en fonction de vos besoins.
      const url = `/api/reservation/onglerie?salon=${encodeURIComponent(
        targetSalon
      )}&dates=${dates.join(",")}`;
      const response = await fetch(url);

      if (!response.ok)
        throw new Error(
          `Erreur lors de la récupération des réservations : ${response.statusText}`
        );

      const data = await response.json();
      console.log("Réservations récupérées de la BDD :", data);

      return data.reservations.map((reservation: Booking) => ({
        date: reservation.date,
        startTime: reservation.startTime,
        duration: reservation.duration,
        endTime: reservation.endTime,
      }));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations de la BDD :",
        error
      );
      return [];
    }
  };

  const fetchBookings = async (
    targetSalon: string,
    dates: string[],
    durationInMinutes: number
  ): Promise<Booking[]> => {
    try {
      const url = `/api/reservation/onglerie?salon=${encodeURIComponent(
        targetSalon
      )}&dates=${dates.join(",")}`;
      const response = await fetch(url);

      if (!response.ok)
        throw new Error(`Error fetching bookings: ${response.statusText}`);

      const data = await response.json();

      console.log("=== RÉSERVATIONS RÉCUPÉRÉES ===");
      console.log("Salon:", targetSalon);
      console.log("Dates demandées:", dates);
      console.log("Réservations brutes:", data.reservations);

      return data.reservations.map((reservation: Booking) => ({
        date: reservation.date,
        startTime: reservation.startTime,
        duration: reservation.duration,
        endTime: format(
          addMinutes(
            parseISO(`${reservation.date}T${reservation.startTime}`),
            reservation.duration
          ),
          "HH:mm"
        ),
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      return [];
    }
  };

  const fetchSalonData = async (targetSalon: string) => {
    setLoading(true);
    setError(null);

    try {
      const dates = daysOfWeek.map((_, i) =>
        format(addDays(startDate, i), "yyyy-MM-dd")
      );

      console.log("==== FETCH SALON DATA ====");
      console.log("Salon cible:", targetSalon);
      console.log("Dates demandées:", dates);

      // Récupérer les réservations existantes
      const bookings = await fetchBookings(
        targetSalon,
        dates,
        durationInMinutes
      );
      setExistingBookings(bookings);

      const url = `/api/opening-hours?salon=${encodeURIComponent(
        targetSalon
      )}&dates=${dates.join(",")}`;
      console.log("URL appelée:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("Réponse de l'API pour", targetSalon, ":");
      console.log(JSON.stringify(data, null, 2));
      console.log("=========================");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des horaires");
      }

      return { dates, data };
    } catch (err) {
      console.error("Erreur détaillée pour", targetSalon, ":", err);
      throw err;
    }
  };

  const generateTimeSlots = (
    date: string,
    startTime: string,
    endTime: string,
    durationInMinutes: number,
    existingBookings: Booking[] = [],
    timeSlots: { startTime: string; endTime: string }[] = []
  ): string[] => {
    const slots: string[] = [];
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    let currentMinutes = startMinutes;
  
    // Trier les réservations existantes par heure de début
    const sortedBookings = existingBookings
      .filter((booking) => booking.date === date)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  
    // Fonction pour vérifier si un créneau est disponible
    const isSlotAvailable = (start: number, duration: number) => {
      const end = start + duration;
  
      // Vérifier les pauses définies
      const hasBreakConflict = timeSlots.some((break_) => {
        const breakStart = timeToMinutes(break_.startTime);
        const breakEnd = timeToMinutes(break_.endTime);
        return (start < breakEnd && end > breakStart);
      });
  
      if (hasBreakConflict) return false;
  
      // Vérifier les réservations existantes en tenant compte de la durée complète
      const hasBookingConflict = sortedBookings.some((booking) => {
        const bookingStart = timeToMinutes(booking.startTime);
        const bookingEnd = bookingStart + booking.duration;
        return (start < bookingEnd && end > bookingStart);
      });
  
      return !hasBookingConflict;
    };
  
    // Générer les créneaux disponibles
    while (currentMinutes + durationInMinutes <= endMinutes) {
      if (isSlotAvailable(currentMinutes, durationInMinutes)) {
        slots.push(formatMinutesToTime(currentMinutes));
        currentMinutes += 15; // Avancer par intervalles de 15 minutes
      } else {
        // Trouver la prochaine plage disponible
        const nextBooking = sortedBookings.find(booking => 
          timeToMinutes(booking.startTime) > currentMinutes
        );
  
        if (nextBooking) {
          // Sauter directement à la fin de la réservation
          currentMinutes = timeToMinutes(nextBooking.startTime) + nextBooking.duration;
        } else {
          // Si pas de prochaine réservation, avancer de 15 minutes
          currentMinutes += 15;
        }
      }
    }
  
    return slots;
  };

  // Fonctions utilitaires
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const processOpeningHours = (
    dates: string[],
    data: { [date: string]: DayInfo }, // On définit explicitement le type de `data`
    salonName: string
  ) => {
    const newTimeSlots: { [date: string]: string[] } = {};
    const newOpeningHours: { [date: string]: OpeningHour } = {};

    console.log("Processing data for", salonName, ":", data);

    dates.forEach((date) => {
      const dayInfo = data[date]; // Récupère les informations pour chaque date

      console.log("Processing date", date, "with info:", dayInfo);

      // Crée un objet d'horaires d'ouverture
      newOpeningHours[date] = {
        id: dayInfo?.id || null,
        isClosed: dayInfo?.isClosed ?? false,
        startTime: dayInfo?.startTime || "",
        endTime: dayInfo?.endTime || "",
        salon: salonName,
      };

      // Vérifie si le jour est ouvert et si des horaires sont définis
      if (!dayInfo?.isClosed && dayInfo?.startTime && dayInfo?.endTime) {
        // Générer les créneaux horaires seulement si les horaires sont définis
        const slots = generateTimeSlots(
          date,
          dayInfo.startTime,
          dayInfo.endTime,
          durationInMinutes,
          existingBookings,
          dayInfo.timeSlots || [] // Si `timeSlots` est undefined, on passe un tableau vide
        );

        // console.log("Generated slots for", date, ":", slots);
        newTimeSlots[date] = slots;
      } else {
        // Si le jour est fermé ou si les horaires ne sont pas définis
        newTimeSlots[date] = [];
      }
    });

    return { newTimeSlots, newOpeningHours };
  };

  useEffect(() => {
    const loadSalonData = async () => {
      try {
        const { dates, data } = await fetchSalonData(salon);

        // Récupérer les réservations existantes
        const bookings = await fetchExistingBookings(salon, dates);
        setExistingBookings(bookings);

        // Traiter les horaires d'ouverture
        const { newTimeSlots, newOpeningHours } = processOpeningHours(
          dates,
          data,
          salon
        );

        const allDaysClosed = Object.values(newOpeningHours).every(
          (day) => day.isClosed
        );

        if (allDaysClosed) {
          const alternateSalon = getAlternateSalon(salon);
          console.log("Loading alternate salon:", alternateSalon);

          const alternateData = await fetchSalonData(alternateSalon);
          const alternateProcessed = processOpeningHours(
            alternateData.dates,
            alternateData.data,
            alternateSalon
          );

          setWeeklyTimeSlots(alternateProcessed.newTimeSlots);
          setOpeningHours(alternateProcessed.newOpeningHours);
          setActiveSalon(alternateSalon);
        } else {
          setWeeklyTimeSlots(newTimeSlots);
          setOpeningHours(newOpeningHours);
          setActiveSalon(salon);
        }
      } catch (err) {
        setError("Impossible de charger les créneaux horaires.");
      } finally {
        setLoading(false);
      }
    };

    loadSalonData();
  }, [startDate, salon, durationInMinutes]);

  const handleSlotSelect = (date: string, time: string) => {
    // Vérification si le créneau est déjà réservé
    // const newBooking: Booking = {
    //   date,
    //   startTime: time,
    //   duration: durationInMinutes,
    // };
    // Ajouter la réservation à l'état existant des réservations
    // setExistingBookings((prevBookings) => [...prevBookings, newBooking]);
    // Mettre à jour le créneau sélectionné
    setSelectedSlot({ date, time });

    // Appeler la fonction onSelect pour notifier le parent
    onSelect(date, time);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setStartDate(addDays(startDate, -7))}
          className="text-green font-bold text-lg px-4 py-2"
          aria-label="Semaine précédente"
        >
          &larr;
        </button>
        <div className="text-center">
          <h2 className="text-green text-xl font-bold">
            Semaine du {format(startDate, "dd MMM", { locale: fr })} au{" "}
            {format(addDays(startDate, 6), "dd MMM", { locale: fr })}
          </h2>
        </div>
        <button
          onClick={() => setStartDate(addDays(startDate, 7))}
          className="text-green font-bold text-lg px-4 py-2"
          aria-label="Semaine suivante"
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
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {daysOfWeek.map((day, index) => {
            const currentDate = addDays(startDate, index);
            const formattedDate = format(currentDate, "yyyy-MM-dd");
            const displayDate = format(currentDate, "dd MMM", { locale: fr });
            const slots = weeklyTimeSlots[formattedDate] || [];
            const isCurrentDay = isSameDay(currentDate, new Date());
            const isPastDay =
              isBefore(currentDate, new Date()) && !isCurrentDay;
            const dayHours = openingHours[formattedDate];

            if (!dayHours) {
              return (
                <div
                  key={day}
                  className="flex flex-col items-center text-center"
                >
                  <h3 className="font-semibold text-green mb-2 capitalize">
                    {day}
                    <span className="block text-sm text-gray-500">
                      {displayDate}
                    </span>
                  </h3>
                  <p className="text-gray-400 text-sm">Aucun horaire défini</p>
                </div>
              );
            }

            const isClosed = dayHours?.isClosed;

            return (
              <div key={day} className="flex flex-col items-center text-center">
                <h3 className="font-semibold text-green mb-2 capitalize">
                  {day}
                  <span className="block text-sm text-gray-500">
                    {displayDate}
                  </span>
                </h3>
                <div className="space-y-2 w-full">
                  {isPastDay ? (
                    <p className="text-gray-400 text-sm">Passé</p>
                  ) : isClosed ? (
                    <p className="text-red-500 text-sm">Fermé</p>
                  ) : slots.length > 0 ? (
                    slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.date === formattedDate &&
                        selectedSlot?.time === slot;

                      const endTime = format(
                        addMinutes(
                          parseISO(`${formattedDate}T${slot}`),
                          durationInMinutes
                        ),
                        "HH:mm"
                      );

                      const isBooked = existingBookings.some((booking) => {
                        if (booking.date !== formattedDate) return false;
                        const bookingStart = parseISO(
                          `${booking.date}T${booking.startTime}`
                        );
                        const bookingEnd = addMinutes(
                          bookingStart,
                          booking.duration
                        );
                        const slotStart = parseISO(`${formattedDate}T${slot}`);
                        const slotEnd = addMinutes(
                          slotStart,
                          durationInMinutes
                        );

                        return (
                          isWithinInterval(slotStart, {
                            start: bookingStart,
                            end: bookingEnd,
                          }) ||
                          isWithinInterval(slotEnd, {
                            start: bookingStart,
                            end: bookingEnd,
                          }) ||
                          (slotStart <= bookingStart && slotEnd >= bookingEnd)
                        );
                      });

                      // Ne rendre que les créneaux qui ne sont pas réservés
                      if (!isBooked) {
                        return (
                          <button
                            key={`${formattedDate}-${slot}`}
                            onClick={() =>
                              handleSlotSelect(formattedDate, slot)
                            }
                            className={`
            w-full py-2 text-sm rounded-lg transition-colors
            ${
              isSelected
                ? "bg-green text-white"
                : "bg-gray-100 hover:bg-gray-200 text-green"
            }
          `}
                            aria-pressed={isSelected}
                          >
                            {slot.replace(":", "h")} -{" "}
                            {endTime.replace(":", "h")}
                          </button>
                        );
                      }
                      return null; // Ne rien rendre pour les créneaux réservés
                    })
                  ) : (
                    <p className="text-red-500 text-sm">Aucun créneau</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className="mt-4 p-4 bg-green/10 rounded-lg">
          <p className="text-green text-center font-semibold">
            Créneau sélectionné :{" "}
            {format(new Date(selectedSlot.date), "dd/MM/yyyy", { locale: fr })}{" "}
            de {selectedSlot.time.replace(":", "h")} à{" "}
            {format(
              addMinutes(
                parseISO(`${selectedSlot.date}T${selectedSlot.time}`),
                durationInMinutes
              ),
              "HH:mm"
            ).replace(":", "h")}
          </p>
        </div>
      )}
    </div>
  );
}
