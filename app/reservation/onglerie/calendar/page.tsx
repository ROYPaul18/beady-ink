'use client'
import 'react-calendar/dist/Calendar.css';
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import OnglerieRecap from "@/app/ui/reservation/OnglerieRecap";
import { useReservation } from '@/app/context/ReservationContext';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

export default function ReservationCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<string>("Soye en septaine");
  const [displayedSlots, setDisplayedSlots] = useState(6); // Nombre de créneaux affichés
  const router = useRouter();
  const { prestationsComplementaires, setPrestationsComplementaires } = useReservation();

  const handleDateChange = (value: Date | Date[]) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleRemovePrestation = (id: number) => {
    const updatedPrestations = prestationsComplementaires.filter((p) => p.id !== id);
    setPrestationsComplementaires(updatedPrestations);
  };

  const handleFinish = async () => {
    if (selectedDate && selectedTime) {
      try {
        const prestationIds = prestationsComplementaires.map((prestation) => prestation.id);
  
        const response = await fetch("/api/reservation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate.toISOString(),
            time: selectedTime,
            salon: selectedSalon,
            serviceId: 1,
            prestationIds,
          }),
        });
  
        if (response.ok) {
          alert("Réservation enregistrée !");
          router.push("/profile");
        } else {
          const errorData = await response.json();
          alert(`Erreur lors de la réservation : ${errorData.message}`);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    } else {
      alert("Veuillez sélectionner une date et une heure.");
    }
  };

  const durationInMinutes = useMemo(() => {
    return prestationsComplementaires.reduce((acc, p) => acc + p.duration, 0);
  }, [prestationsComplementaires]);

  const times = useMemo(() => {
    const startTime = 9 * 60;
    const endTime = 19 * 60;
    const timeSlots = [];
    const durationIncrement = Math.max(durationInMinutes, 30);

    for (let time = startTime; time + durationIncrement <= endTime; time += durationIncrement) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const formattedTime = `${hours}h${minutes === 0 ? "00" : minutes}`;
      timeSlots.push(formattedTime);
    }

    return timeSlots;
  }, [durationInMinutes]);

  // Gestion de l'événement de défilement pour charger plus de créneaux
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottomReached = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottomReached && displayedSlots < times.length) {
      setDisplayedSlots((prevSlots) => Math.min(prevSlots + 3, times.length));
    }
  };

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-8">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
        Choix d'un horaire
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="md:col-span-2 p-4 shadow-lg rounded-md flex flex-col md:flex-row max-h-[500px]"> 
          <div className="flex-1 md:pr-4 max-h-[300px] overflow-y-auto scrollbar-custom" style={{ backgroundColor: "#454C22" }}>
            <Calendar
              onChange={(value) => handleDateChange(value as Date)}
              value={selectedDate}
              minDate={new Date()}
              className="react-calendar border-none w-full"
            />
          </div>

          <div
            className="flex-1 bg-gray-100 p-4 rounded-md shadow-inner md:ml-4 mt-4 md:mt-0 md:w-1/3 time-slot-list overflow-y-auto"
            style={{ maxHeight: '300px' }}
            onScroll={handleScroll}
          >
            <h2 className="text-green text-xl font-bold mb-4">
              Créneaux disponibles
            </h2>
            <div className="flex flex-col gap-2">
              {times.slice(0, displayedSlots).map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`p-2 rounded-md text-center ${
                    selectedTime === time ? "bg-green text-white" : "bg-white border border-green text-green hover:bg-green hover:text-white transition"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-md flex flex-col justify-between">
          <div>
            <h2 className="text-green text-xl font-bold mb-4">
              Choix de mon salon
            </h2>
            <select
              value={selectedSalon}
              onChange={(e) => setSelectedSalon(e.target.value)}
              className="w-full p-2 border border-green rounded-md mb-6"
            >
              <option value="Soye en septaine">Soye en septaine</option>
              <option value="Soye en septaine">Flavigny</option>
            </select>

            <h2 className="text-green text-xl font-bold mb-4">
              Mes prestations
            </h2>
            <OnglerieRecap prestations={prestationsComplementaires} onRemovePrestation={handleRemovePrestation} />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => router.back()}
              className="bg-transparent border border-green text-green hover:bg-green hover:text-white px-4 py-2 rounded-md"
            >
              <span className="mr-2">&larr;</span> Étape précédente
            </button>
            <button
              onClick={handleFinish}
              className="bg-green text-white px-4 py-2 rounded-md"
            >
              Finaliser <span className="ml-2">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
