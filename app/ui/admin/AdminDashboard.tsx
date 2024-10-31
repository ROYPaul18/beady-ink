"use client";

import { useState } from "react";
import AddPrestationModal from "@/app/ui/admin/AddPrestationModal";
import PrestationList from "@/app/ui/admin/PrestationList";
import { PrestationWithImages, ReservationWithUser } from "@/lib/types";

interface AdminDashboardProps {
  prestations: PrestationWithImages[];
  reservations: ReservationWithUser[];
}

export default function AdminDashboard({
  prestations,
  reservations: initialReservations,
}: AdminDashboardProps) {
  const [showReservations, setShowReservations] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  const [historiqueReservations, setHistoriqueReservations] = useState<ReservationWithUser[]>([]);

  async function handleStatusChange(id: number, newStatus: string) {
    const response = await fetch(`/api/reservation/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      setReservations((prevReservations) =>
        prevReservations.filter((reservation) => reservation.id !== id)
      );

      if (newStatus === "ACCEPTED") {
        const acceptedReservation = initialReservations.find((res) => res.id === id);
        if (acceptedReservation) {
          setHistoriqueReservations((prev) => [...prev, { ...acceptedReservation, status: newStatus }]);
        }
      }
    }
  }

  return (
    <div>
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setShowReservations(false)}
          className={`px-4 py-2 rounded ${!showReservations ? "bg-green text-white" : "bg-gray-300"}`}
        >
          Voir les Prestations
        </button>
        <button
          onClick={() => setShowReservations(true)}
          className={`px-4 py-2 rounded ${showReservations ? "bg-green text-white" : "bg-gray-300"}`}
        >
          Voir les Réservations
        </button>
      </div>

      {showReservations ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Gestion des Réservations
          </h2>
          <ul>
            {reservations.map((reservation) => (
              <li key={reservation.id} className="border p-4 mb-2 rounded">
                <p><strong>Client :</strong> {reservation.user?.email}</p>
                <p><strong>Date :</strong> {new Date(reservation.date).toLocaleString()}</p>
                <p><strong>Salon :</strong> {reservation.salon}</p>
                <p><strong>Statut :</strong> {reservation.status}</p>
                <p><strong>Prestations :</strong></p>
                <ul className="list-disc pl-5">
                  {reservation.prestations.map((prestation) => (
                    <li key={prestation.id}>
                      {prestation.name} - {prestation.duration} min - {prestation.price} €
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleStatusChange(reservation.id, "REJECTED")}
                    className="bg-red text-white px-4 py-2 rounded"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleStatusChange(reservation.id, "ACCEPTED")}
                    className="bg-green text-white px-4 py-2 rounded"
                  >
                    Accepter
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
            Historique des Réservations Acceptées
          </h2>
          <ul>
            {historiqueReservations.map((reservation) => (
              <li key={reservation.id} className="border p-4 mb-2 rounded bg-gray-50">
                <p><strong>Client :</strong> {reservation.user?.email}</p>
                <p><strong>Date :</strong> {new Date(reservation.date).toLocaleString()}</p>
                <p><strong>Salon :</strong> {reservation.salon}</p>
                <p><strong>Statut :</strong> {reservation.status}</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                  Laisser un avis
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
          <PrestationList prestations={prestations} serviceType="ONGLERIE" />

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
            Galerie Flash Tattoo
          </h2>
          <AddPrestationModal serviceType="FLASH_TATTOO" />
          <PrestationList prestations={prestations} serviceType="FLASH_TATTOO" />

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 mt-8">
            Galerie Tatouage
          </h2>
          <AddPrestationModal serviceType="TATOUAGE" />
          <PrestationList prestations={prestations} serviceType="TATOUAGE" />
        </div>
      )}
    </div>
  );
}
