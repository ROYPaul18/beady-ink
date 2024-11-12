'use client';

import { useState, useEffect } from "react";
import AddPrestationModal from "@/app/ui/admin/AddPrestationModal";
import PrestationList from "@/app/ui/admin/PrestationList";
import ReservationList from "@/app/ui/admin/ReservationList";
import OpeningHoursEditor from "@/app/ui/admin/OpeningHoursEditor";
import { PrestationWithImages, ReservationWithUser, OpeningHour } from "@/lib/types";
import { saveAs } from 'file-saver';

interface AdminDashboardProps {
  prestations: PrestationWithImages[];
  reservations: ReservationWithUser[];
  openingHours: OpeningHour[];
  tattooRequests: TattooRequestWithUser[]; // Ajout de la propriété
}

interface TattooRequestWithUser {
  id: number;
  availability: string;
  size: string;
  placement: string;
  referenceImages: string[];
  healthData: { [key: string]: string };
  user: {
    nom: string;
    phone: string;
  };
}

export default function AdminDashboard({
  prestations,
  reservations: initialReservations,
  openingHours,
  tattooRequests, // Ajout de la propriété
}: AdminDashboardProps) {
  const [showReservations, setShowReservations] = useState(false);
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [showTattooRequests, setShowTattooRequests] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (message: string) => {
    if (Notification.permission === "granted") {
      new Notification("Beaudy Ink - Réservation", {
        body: message,
      });
    }
  };

  const handleAcceptReservation = async (reservationId: number) => {
    try {
      const response = await fetch(`/api/reservation/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
  
      if (!response.ok) throw new Error('Erreur lors de l\'acceptation de la réservation');
  
      // Met à jour le statut de la réservation dans l'état local
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: 'ACCEPTED' } : res
        )
      );
      sendNotification("Réservation acceptée avec succès.");
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleRejectReservation = async (reservationId: number) => {
    try {
      const response = await fetch(`/api/reservation/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
  
      if (!response.ok) throw new Error('Erreur lors du rejet de la réservation');
  
      // Met à jour le statut de la réservation dans l'état local
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: 'REJECTED' } : res
        )
      );
      sendNotification("Réservation rejetée avec succès.");
    } catch (error) {
      console.error(error);
    }
  };
  

  const prestationsWithCategory = prestations.map((prestation) => ({
    ...prestation,
    category: prestation.category ?? null,
  }));

  // Formatage des horaires d'ouverture avec conversion de l'ID en number
  const formattedOpeningHours = openingHours.map((hour) => ({
    ...hour,
    id: hour.id ? Number(hour.id) : undefined,
    startTime: typeof hour.startTime === "string" ? hour.startTime : "",
    endTime: typeof hour.endTime === "string" ? hour.endTime : "",
  }));

  // Fonction pour générer et télécharger le CSV du questionnaire de santé
  const downloadHealthDataCSV = (healthData: { [key: string]: string }, userName: string) => {
    const csvContent = Object.entries(healthData)
      .map(([question, answer]) => `${question},${answer}`)
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${userName}_questionnaire_sante.csv`);
  };

  return (
    <div>
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setShowReservations(false);
            setShowOpeningHours(false);
            setShowTattooRequests(false);
          }}
          className={`px-4 py-2 rounded ${!showReservations && !showOpeningHours && !showTattooRequests ? "bg-green text-white" : "bg-gray-300  hover:bg-green hover:text-white"}`}
        >
          Voir les Prestations
        </button>
        <button
          onClick={() => {
            setShowReservations(true);
            setShowOpeningHours(false);
            setShowTattooRequests(false);
          }}
          className={`px-4 py-2 rounded ${showReservations ? "bg-green text-white" : "bg-gray-300  hover:bg-green hover:text-white"}`}
        >
          Voir les Réservations
        </button>
        <button
          onClick={() => {
            setShowReservations(false);
            setShowOpeningHours(true);
            setShowTattooRequests(false);
          }}
          className={`px-4 py-2 rounded ${showOpeningHours ? "bg-green text-white" : "bg-gray-300 hover:bg-green hover:text-white "}`}
        >
          Gestion des Horaires
        </button>
        <button
          onClick={() => {
            setShowReservations(false);
            setShowOpeningHours(false);
            setShowTattooRequests(true);
          }}
          className={`px-4 py-2 rounded ${showTattooRequests ? "bg-green text-white" : "bg-gray-300  hover:bg-green hover:text-white"}`}
        >
          Voir les Demandes de Tatouage
        </button>
      </div>

      {showReservations ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-green mb-4">
            Liste des Réservations
          </h2>
          <ReservationList
            reservations={reservations}
            onAccept={handleAcceptReservation}
            onReject={handleRejectReservation}
          />
        </div>
      ) : showOpeningHours ? (
        <div className="max-w-5xl mx-auto">
          <OpeningHoursEditor initialHours={formattedOpeningHours} salon="Flavigny" />
        </div>
      ) : showTattooRequests ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-green mb-4">
            Liste des Demandes de Tatouage
          </h2>
          <ul>
            {tattooRequests.map((request) => (
              <li key={request.id} className="bg-white border-b border-gray-200 p-6 shadow-md rounded mb-4 text-green">
                <p><strong>Nom :</strong> {request.user.nom}</p>
                <p><strong>Téléphone :</strong> {request.user.phone}</p>
                <p><strong>Disponibilité :</strong> {request.availability}</p>
                <p><strong>Taille :</strong> {request.size}</p>
                <p><strong>Emplacement :</strong> {request.placement}</p>
                <p><strong>Images de référence :</strong> {request.referenceImages.length} fichier(s)</p>
                <button
                  onClick={() => downloadHealthDataCSV(request.healthData, request.user.nom)}
                  className="mt-4 px-4 py-2 bg-green text-white rounded hover:bg-green-600 transition-colors"
                >
                  Télécharger le Questionnaire Santé
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Prestations Onglerie
          </h2>
          <AddPrestationModal serviceType="ONGLERIE" />
          <PrestationList prestations={prestationsWithCategory} serviceType="ONGLERIE" />

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
            Galerie Flash Tattoo
          </h2>
          <AddPrestationModal serviceType="FLASH_TATTOO" />
          <PrestationList prestations={prestationsWithCategory} serviceType="FLASH_TATTOO" />

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
            Galerie Tatouage
          </h2>
          <AddPrestationModal serviceType="TATOUAGE" />
          <PrestationList prestations={prestationsWithCategory} serviceType="TATOUAGE" />
        </div>
      )}
    </div>
  );
}
