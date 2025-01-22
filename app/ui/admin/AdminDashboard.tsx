'use client';

import { useState } from "react";
import AddPrestationModal from "@/app/ui/admin/AddPrestationModal";
import PrestationList from "@/app/ui/admin/PrestationList";
import ReservationList from "@/app/ui/admin/ReservationList";
import OpeningHoursEditor from "@/app/ui/admin/OpeningHoursEditor";
import TattooRequests from "@/app/ui/admin/TattooRequests"; // Import du composant TattooRequests
import { saveAs } from 'file-saver';
import { PrestationWithImages, ReservationWithUser, OpeningHour, TattooRequestWithUser, FlashTattooRequestWithUser } from "@/lib/types";

interface AdminDashboardProps {
  prestations: PrestationWithImages[];
  reservations: ReservationWithUser[];
  openingHours: OpeningHour[];
  tattooRequests: TattooRequestWithUser[]; // Demandes de tatouage
  flashTattooRequests: FlashTattooRequestWithUser[]; // Demandes de flash tattoo
}

export default function AdminDashboard({
  prestations,
  reservations: initialReservations,
  openingHours,
  tattooRequests, // Demandes de tatouage
  flashTattooRequests, // Demandes de flash tattoo
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'prestations' | 'reservations' | 'openingHours' | 'tattooRequests'>('prestations');
  const [reservations, setReservations] = useState(initialReservations);

  const handleAcceptReservation = async (reservationId: number) => {
    try {
      const response = await fetch(`/api/reservation/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'acceptation de la réservation');

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: 'ACCEPTED' } : res
        )
      );
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

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: 'REJECTED' } : res
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const prestationsWithCategory = prestations.map((prestation) => ({
    ...prestation,
    category: prestation.category ?? null,
  }));

  const formattedOpeningHours = openingHours.map((hour) => ({
    ...hour,
    id: hour.id ? Number(hour.id) : undefined,
    startTime: typeof hour.startTime === "string" ? hour.startTime : "",
    endTime: typeof hour.endTime === "string" ? hour.endTime : "",
  }));

  const downloadHealthDataCSV = (healthData: { [key: string]: string }, userName: string) => {
    const csvContent = Object.entries(healthData)
      .map(([question, answer]) => `${question},${answer}`)
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${userName}_questionnaire_sante.csv`);
  };

  return (
    <div className="px-4 md:px-8 py-4 md:py-8">
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('prestations')}
          className={`px-4 py-2 rounded w-full sm:w-auto ${activeTab === 'prestations' ? "bg-green text-white" : "bg-gray-300 hover:bg-green hover:text-white"}`}
        >
          Voir les Prestations
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded w-full sm:w-auto ${activeTab === 'reservations' ? "bg-green text-white" : "bg-gray-300 hover:bg-green hover:text-white"}`}
        >
          Voir les Réservations
        </button>
        <button
          onClick={() => setActiveTab('openingHours')}
          className={`px-4 py-2 rounded w-full sm:w-auto ${activeTab === 'openingHours' ? "bg-green text-white" : "bg-gray-300 hover:bg-green hover:text-white"}`}
        >
          Gestion des Horaires
        </button>
        <button
          onClick={() => setActiveTab('tattooRequests')}
          className={`px-4 py-2 rounded w-full sm:w-auto ${activeTab === 'tattooRequests' ? "bg-green text-white" : "bg-gray-300 hover:bg-green hover:text-white"}`}
        >
          Voir les Demandes de Tatouage
        </button>
      </div>

      {activeTab === 'prestations' && (
        <div className="max-w-full sm:max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Prestations Onglerie</h2>
          <AddPrestationModal serviceType="ONGLERIE" />
          <PrestationList prestations={prestationsWithCategory} serviceType="ONGLERIE" />

          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">Galerie Flash Tattoo</h2>
          <AddPrestationModal serviceType="FLASH_TATTOO" />
          <PrestationList prestations={prestationsWithCategory} serviceType="FLASH_TATTOO" />

          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">Galerie Tatouage</h2>
          <AddPrestationModal serviceType="TATOUAGE" />
          <PrestationList prestations={prestationsWithCategory} serviceType="TATOUAGE" />
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="max-w-full sm:max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green mb-4">Liste des Réservations</h2>
          <ReservationList
            reservations={reservations}
            onAccept={handleAcceptReservation}
            onReject={handleRejectReservation}
          />
        </div>
      )}

      {activeTab === 'openingHours' && (
        <div className="max-w-full sm:max-w-5xl mx-auto">
          <OpeningHoursEditor initialHours={formattedOpeningHours} salon="Flavigny" />
        </div>
      )}
      {activeTab === 'tattooRequests' && (
        <TattooRequests
          tattooRequests={tattooRequests}
          flashTattooRequests={flashTattooRequests}
          prestations={prestationsWithCategory}
        />
      )}
    </div>
  );
}
