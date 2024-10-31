'use client'
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
        return "Reprendre un autre Rendez-vous";
      case "PENDING":
        return "En attente";
      default:
        return status;
    }
  };

  return (
    <div className="p-6 rounded-md w-full max-w-lg">
      <h2 className="text-3xl font-semibold mb-4 text-center">Mes Réservations</h2>
      
      <h3 className="text-2xl font-semibold mt-6 mb-4">Prochains Rendez-vous</h3>
      <ul>
        {upcomingReservations.map((reservation) => (
          <li key={reservation.id} className="border p-4 my-2 rounded bg-green-100 text-green-700">
            <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
            <p><strong>Salon :</strong> {reservation.salon}</p>
            <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>
          </li>
        ))}
      </ul>

      <h3 className="text-2xl font-semibold mt-6 mb-4">Rendez-vous Passés</h3>
      <ul>
        {pastReservations.map((reservation) => (
          <li key={reservation.id} className="border p-4 my-2 rounded bg-gray-200 text-gray-500">
            <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
            <p><strong>Salon :</strong> {reservation.salon}</p>
            <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>

            {/* Vérifiez si une prestation est disponible pour laisser un avis */}
            {reservation.prestations.length > 0 ? (
              <>
                <button
                  onClick={() => setShowReviewForm(showReviewForm === reservation.id ? null : reservation.id)}
                  className="bg-green text-white px-4 py-2 rounded mt-2"
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
    </div>
  );
}