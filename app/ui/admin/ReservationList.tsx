'use client';

import { useState } from "react";
import { ReservationWithUser } from "@/lib/types";
interface User {
  id: number;
  email: string;
  telephone?: string; // Ajoutez cette ligne
  nom?: string; // Ajoutez d'autres propriétés si nécessaires
}
interface ReservationListProps {
  reservations: ReservationWithUser[];
  onAccept: (reservationId: number) => void;
  onReject: (reservationId: number) => void;
}

export default function ReservationList({
  reservations,
  onAccept,
  onReject,
}: ReservationListProps) {
  const [filter, setFilter] = useState<'upcoming' | 'pending' | 'past'>('upcoming');
  const currentDate = new Date();

  // Filtrer les réservations en fonction du filtre sélectionné
  const filteredReservations = reservations.filter((reservation) => {
    if (filter === 'upcoming') {
      return reservation.status === "ACCEPTED" && new Date(reservation.date) >= currentDate;
    } else if (filter === 'pending') {
      return reservation.status === "PENDING";
    } else if (filter === 'past') {
      return reservation.status === "ACCEPTED" && new Date(reservation.date) < currentDate;
    }
    return false;
  });

  return (
    <div className="min-h-[50vh] flex flex-col">
      {/* Boutons de filtre */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded ${filter === 'upcoming' ? "bg-green text-white" : "bg-gray-300"}`}
        >
          À venir
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? "bg-yellow-500 text-white" : "bg-gray-300"}`}
        >
          À valider
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded ${filter === 'past' ? "bg-gray-500 text-white" : "bg-gray-300"}`}
        >
          Passé
        </button>
      </div>

      {/* Liste des réservations filtrées ou message si aucune réservation n'est trouvée */}
      {filteredReservations.length > 0 ? (
        <ul className="flex-grow">
          {filteredReservations.map((reservation) => (
            <li key={reservation.id} className="border p-4 my-2 rounded bg-gray-100">
              <p><strong>Date :</strong> {new Date(reservation.date).toLocaleString('fr-FR', { timeZone: 'UTC' })}</p>
              <p><strong>Salon :</strong> {reservation.salon}</p>
              <p><strong>Client :</strong> {reservation.user.email}</p>
              <p><strong>Téléphone :</strong> {reservation.user.telephone || 'Non fourni'}</p>
              <p><strong>Nom Prénom</strong> {reservation.user.nom || 'Non fourni'}</p>

              <ul>
                <strong>Prestations :</strong>
                {reservation.prestations.map((prestation) => (
                  <li key={prestation.id} className="ml-4">
                    - {prestation.name} ({prestation.duration} min)
                  </li>
                ))}
              </ul>
  
              {reservation.status === "PENDING" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => onAccept(reservation.id)}
                    className="bg-green text-white px-4 py-2 rounded"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => onReject(reservation.id)}
                    className="bg-red text-white px-4 py-2 rounded"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        // Message affiché si aucune réservation ne correspond au filtre sélectionné
        <div className="flex-grow flex items-center justify-center text-center text-gray-500">
          Aucune réservation {filter === 'upcoming' ? 'à venir' : filter === 'pending' ? 'à valider' : 'passée'} pour le moment.
        </div>
      )}
    </div>
  );
}
