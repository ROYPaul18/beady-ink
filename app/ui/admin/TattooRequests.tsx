"use client";
import Image from "next/image";

import { useState } from "react";
import { TattooRequestWithUser, FlashTattooRequestWithUser } from "@/lib/types";
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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 min-h-[40vh]">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-green mb-4">
        Liste des Demandes de Tatouage
      </h2>

      {/* Tabs - Full width on mobile, auto on desktop */}
      <div className="grid grid-cols-2 gap-2 mb-4 md:flex md:gap-4">
        <button
          className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded transition-colors ${
            activeTab === "tattoo"
              ? "bg-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green/20"
          }`}
          onClick={() => setActiveTab("tattoo")}
        >
          Demandes de Tatouage
        </button>
        <button
          className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded transition-colors ${
            activeTab === "flashTattoo"
              ? "bg-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green/20"
          }`}
          onClick={() => setActiveTab("flashTattoo")}
        >
          Flash Tattoo
        </button>
      </div>

      {/* Request Lists */}
      {activeTab === "tattoo" ? (
        <div className="space-y-4">
          {tattooRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-4 md:p-6 text-sm md:text-base"
            >
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p>
                    <span className="font-medium">Nom :</span>{" "}
                    {request.user.nom}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone :</span>{" "}
                    {request.user.phone}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p>
                    <span className="font-medium">Disponibilité :</span>{" "}
                    {request.availability}
                  </p>
                  <p>
                    <span className="font-medium">Taille :</span> {request.size}
                  </p>
                </div>

                <p>
                  <span className="font-medium">Emplacement :</span>{" "}
                  {request.placement}
                </p>

                {request.referenceImages.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium mb-2">Images de référence :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {request.referenceImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative w-full h-32">
                          {" "}
                          {/* Add a wrapper div with a key */}
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

                <button
                  onClick={() =>
                    downloadHealthDataCSV(request.healthData, request.user.nom)
                  }
                  className="w-full md:w-auto mt-4 px-4 py-2 text-sm md:text-base bg-green text-white rounded hover:bg-green/90 transition-colors"
                >
                  Télécharger le Questionnaire
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {flashTattooRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-4 md:p-6 text-sm md:text-base"
            >
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p>
                    <span className="font-medium">Nom :</span>{" "}
                    {request.user.nom}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone :</span>{" "}
                    {request.user.phone}
                  </p>
                </div>

                <p>
                  <span className="font-medium">Flash Tattoo ID :</span>{" "}
                  {request.flashTattooId}
                </p>

                <button
                  onClick={() =>
                    downloadHealthDataCSV(request.healthData, request.user.nom)
                  }
                  className="w-full md:w-auto mt-4 px-4 py-2 text-sm md:text-base bg-green text-white rounded hover:bg-green/90 transition-colors"
                >
                  Télécharger le Questionnaire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
