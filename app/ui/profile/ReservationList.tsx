'use client';

import { useState } from "react";
import { format } from "date-fns";
import ReviewForm from "./ReviewForm";

interface Reservation {
  id: number;
  date: Date;
  salon: string;
  status: string;
  prestations: { id: number; name: string }[];
}

interface ReservationListProps {
  reservations: Reservation[];
}

export default function ReservationList({ reservations }: ReservationListProps) {
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);

  const upcomingReservations = reservations
    .filter((reservation) => new Date(reservation.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastReservations = reservations
    .filter((reservation) => new Date(reservation.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Confirmé";
      case "REJECTED":
        return "Annulé";
      case "PENDING":
        return "En attente";
      default:
        return status;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-600 text-white";
      case "PENDING":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  return (
    <div className="p-4 sm:p-6 mx-auto max-w-full sm:max-w-lg rounded-md">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-green-700">Mes Réservations</h2>

      {/* Message d'absence de réservations */}
      {upcomingReservations.length === 0 && pastReservations.length === 0 && (
        <p className="text-center text-gray-600 mb-6">Aucune réservation à afficher pour le moment. Elles apparaîtront ici lorsque vous en ferez.</p>
      )}

      <h3 className="text-2xl sm:text-3xl font-semibold mt-6 mb-4 text-green-700">Prochains Rendez-vous</h3>
      {upcomingReservations.length === 0 ? (
        <p className="text-center text-gray-600">Vous n'avez pas de rendez-vous à venir.</p>
      ) : (
        <ul>
          {upcomingReservations.map((reservation) => (
            <li
              key={reservation.id}
              className={`border p-4 my-2 rounded-md ${getStatusStyles(reservation.status)}`}
            >
              <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
              <p><strong>Salon :</strong> {reservation.salon}</p>
              <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>

              {/* Bouton de modification de la date pour les rendez-vous annulés */}
              {reservation.status === "REJECTED" && (
                <button
                  onClick={() => alert("Rediriger vers la page de modification de date")}
                  className="bg-white text-red-600 px-4 py-2 rounded-md mt-2 hover:bg-red-200 transition-all"
                >
                  Modifier la date
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-2xl sm:text-3xl font-semibold mt-6 mb-4 text-green-700">Rendez-vous Passés</h3>
      {pastReservations.length === 0 ? (
        <p className="text-center text-gray-600">Vous n'avez pas encore de rendez-vous passés.</p>
      ) : (
        <ul>
          {pastReservations.map((reservation) => (
            <li key={reservation.id} className="border p-4 my-2 rounded-md bg-gray-200 text-gray-500">
              <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
              <p><strong>Salon :</strong> {reservation.salon}</p>
              <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>

              {/* Vérifiez si une prestation est disponible pour laisser un avis */}
              {reservation.prestations.length > 0 ? (
                <>
                  <button
                    onClick={() => setShowReviewForm(showReviewForm === reservation.id ? null : reservation.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-green-700 transition-all"
                  >
                    {showReviewForm === reservation.id ? "Annuler" : "Laisser un avis"}
                  </button>

                  {/* Afficher le formulaire d'avis pour la prestation si le bouton est cliqué */}
                  {showReviewForm === reservation.id && (
                    <div className="mt-4">
                      <ReviewForm prestationId={reservation.prestations[0].id} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600 mt-2">Aucune prestation pour laisser un avis.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
