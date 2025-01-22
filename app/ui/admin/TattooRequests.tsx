"use client";

import Image from "next/image";
import { useState } from "react";
import {
  TattooRequestWithUser,
  FlashTattooRequestWithUser,
  Prestation,
} from "@/lib/types";
import { saveAs } from "file-saver";

interface TattooRequestsProps {
  tattooRequests: TattooRequestWithUser[];
  flashTattooRequests: FlashTattooRequestWithUser[];
  prestations: Prestation[];
}

export default function TattooRequests({
  tattooRequests,
  flashTattooRequests,
  prestations,
}: TattooRequestsProps) {
  const [activeTab, setActiveTab] = useState<
    "tattoo" | "flashTattoo" | "validatedTattoo" | "validatedFlashTattoo"
  >("tattoo");

  const [validatedTattooRequests, setValidatedTattooRequests] = useState<
    TattooRequestWithUser[]
  >([]);
  const [validatedFlashTattooRequests, setValidatedFlashTattooRequests] =
    useState<FlashTattooRequestWithUser[]>([]);

  const downloadHealthDataCSV = (
    healthData: { [key: string]: string },
    userName: string
  ) => {
    const csvContent = Object.entries(healthData)
      .map(([question, answer]) => `"${question}","${answer}"`)
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${userName}_questionnaire_sante.csv`);
  };

  const handleValidateTattooRequest = (request: TattooRequestWithUser) => {
    setValidatedTattooRequests((prev) => [...prev, request]);
  };

  const handleValidateFlashTattooRequest = (
    request: FlashTattooRequestWithUser
  ) => {
    setValidatedFlashTattooRequests((prev) => [...prev, request]);
  };

  const getFlashTattooDetails = (
    flashTattooId: number,
    prestations: Prestation[]
  ) => {
    const prestation = prestations.find((p) => p.id === flashTattooId);
    return {
      image: prestation?.images.length ? prestation.images[0].url : null,
      name: prestation?.name || "Inconnu", // Si le nom n'existe pas, mettre "Inconnu"
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 min-h-[40vh]">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-green mb-4">
        Liste des Demandes
      </h2>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4 md:flex md:gap-4">
        <button
          className={`px-3 py-2 text-sm rounded transition-colors ${
            activeTab === "tattoo"
              ? "bg-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green/20"
          }`}
          onClick={() => setActiveTab("tattoo")}
        >
          Tatouages
        </button>
        <button
          className={`px-3 py-2 text-sm rounded transition-colors ${
            activeTab === "flashTattoo"
              ? "bg-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green/20"
          }`}
          onClick={() => setActiveTab("flashTattoo")}
        >
          Flash Tattoos
        </button>
        <button
          className={`px-3 py-2 text-sm rounded transition-colors ${
            activeTab === "validatedTattoo"
              ? "bg-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green/20"
          }`}
          onClick={() => setActiveTab("validatedTattoo")}
        >
          Tatouages Validés
        </button>
        <button
          className={`px-3 py-2 text-sm rounded transition-colors ${
            activeTab === "validatedFlashTattoo"
              ? "bg-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green/20"
          }`}
          onClick={() => setActiveTab("validatedFlashTattoo")}
        >
          Flash Tattoos Validés
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tattoo" && (
        <div className="space-y-4">
          {tattooRequests
            .filter((request) => !validatedTattooRequests.includes(request))
            .map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Nom :</span>{" "}
                    {request.user.nom}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone :</span>{" "}
                    {request.user.phone}
                  </p>
                  <p>
                    <span className="font-medium">Disponibilité :</span>{" "}
                    {request.availability}
                  </p>
                  <p>
                    <span className="font-medium">Taille :</span> {request.size}
                  </p>
                  <p>
                    <span className="font-medium">Emplacement :</span>{" "}
                    {request.placement}
                  </p>

                  {/* Images de référence */}
                  {request.referenceImages.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">Images de référence :</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {request.referenceImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative w-full h-32">
                            <Image
                              src={imgUrl}
                              alt={`Référence ${idx + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() =>
                        downloadHealthDataCSV(
                          request.healthData,
                          request.user.nom
                        )
                      }
                      className="px-4 py-2 text-sm bg-green text-white rounded hover:bg-green/90"
                    >
                      Télécharger le Questionnaire
                    </button>
                    <button
                      onClick={() => handleValidateTattooRequest(request)}
                      className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "flashTattoo" && (
        <div className="space-y-4">
          {flashTattooRequests
            .filter(
              (request) => !validatedFlashTattooRequests.includes(request)
            )
            .map((request) => {
              const { image: flashImage, name: prestationName } =
                getFlashTattooDetails(request.flashTattooId, prestations);

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Nom :</span>{" "}
                      {request.user.nom}
                    </p>
                    <p>
                      <span className="font-medium">Téléphone :</span>{" "}
                      {request.user.phone}
                    </p>
                    <p>
                      <span className="font-medium">Prestation :</span>{" "}
                      {prestationName}
                    </p>
                    {/* Affichage de l'image du flash tattoo */}
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() =>
                          downloadHealthDataCSV(
                            request.healthData,
                            request.user.nom
                          )
                        }
                        className="px-4 py-2 text-sm bg-green text-white rounded hover:bg-green/90"
                      >
                        Télécharger le Questionnaire
                      </button>
                      <button
                        onClick={() =>
                          handleValidateFlashTattooRequest(request)
                        }
                        className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {activeTab === "validatedTattoo" && (
        <div className="space-y-4">
          {validatedTattooRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
              <p>
                <span className="font-medium">Nom :</span> {request.user.nom}
              </p>
              <p>
                <span className="font-medium">Disponibilité :</span>{" "}
                {request.availability}
              </p>
              <p>
                <span className="font-medium">Taille :</span> {request.size}
              </p>
              <p>
                <span className="font-medium">Emplacement :</span>{" "}
                {request.placement}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "validatedFlashTattoo" && (
        <div className="space-y-4">
          {validatedFlashTattooRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
              <p>
                <span className="font-medium">Nom :</span> {request.user.nom}
              </p>
              <p>
                <span className="font-medium">Flash Tattoo ID :</span>{" "}
                {request.flashTattooId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
