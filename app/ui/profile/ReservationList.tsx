'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";

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

  const upcomingReservations = reservations
    .filter((reservation) => new Date(reservation.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastReservations = reservations
    .filter((reservation) => new Date(reservation.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    const fetchTattooRequests = async () => {
      const response = await fetch("/api/reservation/tatouage");
      const data = await response.json();
      if (data.success) setTattooRequests(data.tattooRequests);
    };

    const fetchFlashTattooRequests = async () => {
      const response = await fetch("/api/reservation/flashTattoo");
      const data = await response.json();
      if (data.success) setFlashTattooRequests(data.flashTattooRequests);
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

  const sections: Array<'reservations' | 'tattooRequests' | 'flashTattooRequests'> = [
    'reservations',
    'tattooRequests',
    'flashTattooRequests'
  ];

  return (
    <div className="p-4 sm:p-6 mx-auto max-w-full sm:max-w-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-green-700">Mes Réservations</h2>

      {/* Boutons de navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === section ? "bg-green text-white" : "bg-gray-300 text-gray-700 hover:bg-green-500 hover:text-white"
            }`}
          >
            {section === 'reservations' ? 'Réservations' : section === 'tattooRequests' ? 'Tatouages' : 'Flash Tattoos'}
          </button>
        ))}
      </div>

      {/* Contenu défilant */}
      <div className="overflow-y-auto max-h-[75vh]">
        {isLoading ? (
          <p className="text-center text-gray-500 py-4">Chargement...</p>
        ) : (
          <>
            {activeSection === 'reservations' && (
              <>
                {/* Réservations à venir */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-700">À venir</h3>
                  {upcomingReservations.length === 0 ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Aucun rendez-vous à venir.</p>
                      <Link
                        href="/reservation/onglerie"
                        className="inline-block px-4 py-2 bg-green text-white rounded-md hover:bg-green-600"
                      >
                        Réserver maintenant
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {upcomingReservations.map((reservation) => (
                        <li
                          key={reservation.id}
                          className={`p-4 border rounded-md shadow-sm ${getStatusStyles(reservation.status)}`}
                        >
                          <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
                          <p><strong>Salon :</strong> {reservation.salon}</p>
                          <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>
                          {reservation.status === "REJECTED" && (
                            <div className="mt-2 text-center">
                              <Link
                                href="/reservation/onglerie"
                                className="inline-block px-4 py-2 bg-white text-red rounded-md hover:bg-green-600"
                              >
                                Reprendre un rendez-vous
                              </Link>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Réservations passées */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-700">Passées</h3>
                  {pastReservations.length === 0 ? (
                    <p className="text-gray-600 text-center">Aucune réservation passée.</p>
                  ) : (
                    <ul className="space-y-4">
                      {pastReservations.map((reservation) => (
                        <li
                          key={reservation.id}
                          className="p-4 border rounded-md shadow-sm bg-gray-50"
                        >
                          <p><strong>Date :</strong> {format(new Date(reservation.date), "dd/MM/yyyy HH:mm")}</p>
                          <p><strong>Salon :</strong> {reservation.salon}</p>
                          <p><strong>Statut :</strong> {getStatusLabel(reservation.status)}</p>
                          <p><strong>Prestations :</strong> {reservation.prestations.map(p => p.name).join(', ')}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {activeSection === 'tattooRequests' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-700">Tatouages</h3>
                {tattooRequests.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Aucune demande de tatouage pour le moment.</p>
                    <Link
                      href="/reservation/tatouage"
                      className="inline-block px-4 py-2 bg-green text-white rounded-md hover:bg-green-600"
                    >
                      Faire une demande
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {tattooRequests.map((request) => (
                      <li key={request.id} className="p-4 border rounded-md shadow-sm bg-gray-50">
                        <p><strong>Disponibilité :</strong> {request.availability}</p>
                        <p><strong>Taille :</strong> {request.size}</p>
                        <p><strong>Placement :</strong> {request.placement}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeSection === 'flashTattooRequests' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-700">Flash Tattoos</h3>
                {flashTattooRequests.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Aucune demande de flash tattoo pour le moment.</p>
                    <Link
                      href="/reservation/flashTattoo"
                      className="inline-block px-4 py-2 bg-green text-white rounded-md hover:bg-green-600"
                    >
                      Découvrir des flashs
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {flashTattooRequests.map((flashRequest) => (
                      <li key={flashRequest.id} className="p-4 border rounded-md shadow-sm bg-gray-50">
                        <p><strong>ID :</strong> {flashRequest.flashTattooId}</p>
                        <p><strong>Données de santé :</strong> {flashRequest.healthData}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
