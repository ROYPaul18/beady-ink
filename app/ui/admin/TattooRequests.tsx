"use client";

import { useState } from "react";
import { TattooRequestWithUser, FlashTattooRequestWithUser } from "@/lib/types"; // Assurez-vous d'importer les types
import { saveAs } from "file-saver";

interface TattooRequestsProps {
  tattooRequests: TattooRequestWithUser[];
  flashTattooRequests: FlashTattooRequestWithUser[];
}

export default function TattooRequests({
  tattooRequests,
  flashTattooRequests,
}: TattooRequestsProps) {
  const [activeTab, setActiveTab] = useState<"tattoo" | "flashTattoo">(
    "tattoo"
  );

  // Fonction pour générer et télécharger le CSV des données de santé

  const downloadHealthDataCSV = (
    healthData: { [key: string]: string },
    userName: string
  ) => {
    // Create CSV content with each question and answer in separate columns
    const csvContent = Object.entries(healthData)
      .map(([question, answer]) => `"${question}","${answer}"`)
      .join("\n"); // Join each line for CSV format

    // Convert the content to a Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Save the file with a specified filename
    saveAs(blob, `${userName}_questionnaire_sante.csv`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold text-green mb-4">
        Liste des Demandes de Tatouage
      </h2>

      {/* Onglets pour basculer entre les demandes de tatouage classique et de flash tattoo */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded ${
            activeTab === "tattoo"
              ? "bg-green text-white"
              : "bg-gray-300 hover:bg-green hover:text-white"
          }`}
          onClick={() => setActiveTab("tattoo")}
        >
          Demandes de Tatouage
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "flashTattoo"
              ? "bg-green text-white"
              : "bg-gray-300 hover:bg-green hover:text-white"
          }`}
          onClick={() => setActiveTab("flashTattoo")}
        >
          Demandes de Flash Tattoo
        </button>
      </div>

      {/* Afficher les demandes en fonction de l'onglet sélectionné */}
      {activeTab === "tattoo" ? (
        <div>
          <ul>
            {tattooRequests.map((request) => (
              <li
                key={request.id}
                className="bg-white border-b border-gray-200 p-6 shadow-md rounded mb-4 text-green"
              >
                <p>
                  <strong>Nom :</strong> {request.user.nom}
                </p>
                <p>
                  <strong>Téléphone :</strong> {request.user.phone}
                </p>
                <p>
                  <strong>Disponibilité :</strong> {request.availability}
                </p>
                <p>
                  <strong>Taille :</strong> {request.size}
                </p>
                <p>
                  <strong>Emplacement :</strong> {request.placement}
                </p>
                <p>
                  <strong>Images de référence :</strong>{" "}
                </p>
                <div className="mt-2">
                  {/* Display reference images */}
                  {request.referenceImages.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Tattoo reference ${idx + 1}`}
                      className="w-32 h-32 object-cover"
                    />
                  ))}
                </div>
                {/* Bouton pour télécharger le CSV */}
                <button
                  onClick={() =>
                    downloadHealthDataCSV(request.healthData, request.user.nom)
                  }
                  className="mt-4 px-4 py-2 bg-green text-white rounded hover:bg-green-600 transition-colors"
                >
                  Télécharger le Questionnaire Santé
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <ul>
            {flashTattooRequests.map((request) => (
              <li
                key={request.id}
                className="bg-white border-b border-gray-200 p-6 shadow-md rounded mb-4 text-green"
              >
                <p>
                  <strong>Nom :</strong> {request.user.nom}
                </p>
                <p>
                  <strong>Téléphone :</strong> {request.user.phone}
                </p>
                <p>
                  <strong>Flash Tattoo ID :</strong> {request.flashTattooId}
                </p>

                <button
                  onClick={() =>
                    downloadHealthDataCSV(request.healthData, request.user.nom)
                  }
                  className="mt-4 px-4 py-2 bg-green text-white rounded hover:bg-green-600 transition-colors"
                >
                  Télécharger le Questionnaire Santé
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
