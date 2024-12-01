'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import ReviewForm from "./ReviewForm";

interface Reservation {
  id: number;
  date: Date;
  salon: string;
  status: string;
  prestations: { id: number; name: string }[];
}

interface TattooRequest {
  id: number;
  availability: string;
  size: string;
  placement: string;
  referenceImages: string[];
  healthData: string;
  status: string;
}

interface FlashTattooRequest {
  id: number;
  flashTattooId: number;
  healthData: string;
  status: string;
}

interface ReservationListProps {
  reservations: Reservation[];
}

export default function ReservationList({ reservations }: ReservationListProps) {
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [tattooRequests, setTattooRequests] = useState<TattooRequest[]>([]);
  const [flashTattooRequests, setFlashTattooRequests] = useState<FlashTattooRequest[]>([]);
  const [activeSection, setActiveSection] = useState<'reservations' | 'tattooRequests' | 'flashTattooRequests'>('reservations');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtrage des réservations à venir
  const upcomingReservations = reservations
    .filter((reservation) => new Date(reservation.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastReservations = reservations
    .filter((reservation) => new Date(reservation.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Récupérer les demandes de tatouage et flash tattoo depuis l'API
  useEffect(() => {
    const fetchTattooRequests = async () => {
      const response = await fetch("/api/reservation/tatouage");
      const data = await response.json();
      if (data.success) {
        setTattooRequests(data.tattooRequests);
      }
    };

    const fetchFlashTattooRequests = async () => {
      const response = await fetch("/api/reservation/flashTattoo");
      const data = await response.json();
      if (data.success) {
        setFlashTattooRequests(data.flashTattooRequests);
      }
    };

    fetchTattooRequests();
    fetchFlashTattooRequests();
    setIsLoading(false);
  }, []);

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
        return "bg-green text-white";
      case "REJECTED":
        return "bg-red text-white";
      case "PENDING":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  return (
    <div className="p-4 sm:p-6 mx-auto max-w-full sm:max-w-lg rounded-md">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-green">Mes Réservations</h2>

      {/* Section de boutons de filtrage */}
      <div className="flex flex-wrap justify-center mb-6 space-x-4 gap-2">
        <button
          onClick={() => setActiveSection('reservations')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 w-full sm:w-auto ${activeSection === 'reservations' ? 'bg-green text-white' : 'bg-gray-300 text-gray-700 hover:bg-green-500 hover:text-white'}`}
        >
          Réservations
        </button>
        <button
          onClick={() => setActiveSection('tattooRequests')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 w-full sm:w-auto ${activeSection === 'tattooRequests' ? 'bg-green text-white' : 'bg-gray-300 text-gray-700 hover:bg-green-500 hover:text-white'}`}
        >
          Demandes de Tatouage
        </button>
        <button
          onClick={() => setActiveSection('flashTattooRequests')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 w-full sm:w-auto ${activeSection === 'flashTattooRequests' ? 'bg-green text-white' : 'bg-gray-300 text-gray-700 hover:bg-green-500 hover:text-white'}`}
        >
          Demandes de Flash Tattoo
        </button>
      </div>

      {/* Affichage en fonction de la section active */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-4">Chargement...</div>
      ) : (
        <>
          {activeSection === 'reservations' && (
            <>
              <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-4 text-green-700">Prochains Rendez-vous</h3>
              {upcomingReservations.length === 0 ? (
                <p className="text-center text-gray-600">Vous n'avez pas de rendez-vous à venir.</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <li key={reservation.id} className={`border p-4 my-2 rounded-md shadow-sm ${getStatusStyles(reservation.status)}`}>
                      <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
                      <p><strong>Salon :</strong> {reservation.salon}</p>
                      <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>
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

              <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-4 text-green-700">Rendez-vous Passés</h3>
              {pastReservations.length === 0 ? (
                <p className="text-center text-gray-600">Vous n'avez pas encore de rendez-vous passés.</p>
              ) : (
                <ul className="space-y-4">
                  {pastReservations.map((reservation) => (
                    <li key={reservation.id} className="border p-4 my-2 rounded-md bg-gray-200 text-gray-500 shadow-sm">
                      <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
                      <p><strong>Salon :</strong> {reservation.salon}</p>
                      <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>
                      {reservation.prestations.length > 0 ? (
                        <>
                          <button
                            onClick={() => setShowReviewForm(showReviewForm === reservation.id ? null : reservation.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-green-700 transition-all"
                          >
                            {showReviewForm === reservation.id ? "Annuler" : "Laisser un avis"}
                          </button>

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
            </>
          )}

          {activeSection === 'tattooRequests' && (
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold mt-6 mb-4 text-green-700">Demandes de Tatouage</h3>
              {tattooRequests.length === 0 ? (
                <p className="text-center text-gray-600">Aucune demande de tatouage pour le moment.</p>
              ) : (
                <ul className="space-y-4">
                  {tattooRequests.map((tattooRequest) => (
                    <li key={tattooRequest.id} className={`border p-4 my-2 rounded-md shadow-sm ${getStatusStyles(tattooRequest.status)}`}>
                      <p><strong>Disponibilité :</strong> {tattooRequest.availability}</p>
                      <p><strong>Taille :</strong> {tattooRequest.size}</p>
                      <p><strong>Placement :</strong> {tattooRequest.placement}</p>        
                      {tattooRequest.referenceImages.length > 0 && (
                        <div className="mt-2">
                          <strong>Images de référence :</strong>
                          {tattooRequest.referenceImages.map((image, index) => (
                            <img key={index} src={image} alt={`Référence ${index + 1}`} className="mt-2 max-w-[200px]" />
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeSection === 'flashTattooRequests' && (
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold mt-6 mb-4 text-green-700">Demandes de Flash Tattoo</h3>
              {flashTattooRequests.length === 0 ? (
                <p className="text-center text-gray-600">Aucune demande de flash tattoo pour le moment.</p>
              ) : (
                <ul className="space-y-4">
                  {flashTattooRequests.map((flashTattooRequest) => (
                    <li key={flashTattooRequest.id} className={`border p-4 my-2 rounded-md shadow-sm ${getStatusStyles(flashTattooRequest.status)}`}>
                      <p><strong>Données de santé :</strong> {flashTattooRequest.healthData}</p>
                      <p><strong>Statut :</strong> {getStatusLabel(flashTattooRequest.status)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
