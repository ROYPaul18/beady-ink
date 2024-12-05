"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PrestationWithImages } from "@/lib/types";
import { ServiceType } from "@prisma/client";

async function getPrestationsWithImages(serviceType: ServiceType): Promise<PrestationWithImages[]> {
  const response = await fetch(`/api/prestation?serviceType=${serviceType}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des prestations");

  const data = await response.json();

  // Assurez-vous que 'prestations' est bien un tableau
  if (!Array.isArray(data.prestations)) {
    console.error("Structure inattendue des données:", data); // log pour débogage
    throw new Error("Les données récupérées ne sont pas un tableau");
  }

  return data.prestations;
}

export default function Gallery() {
  const [prestations, setPrestations] = useState<PrestationWithImages[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType | "ALL">(
    "ALL"
  );
  const [visibleRows, setVisibleRows] = useState(3);

  useEffect(() => {
    async function fetchPrestations() {
      try {
        let data: PrestationWithImages[] = [];
  
        if (selectedService === "ALL") {
          // Fetch prestations for all service types
          const responses = await Promise.all(
            Object.values(ServiceType).map((serviceType) =>
              getPrestationsWithImages(serviceType)
            )
          );
          data = responses.flat();
        } else {
          // Fetch prestations for the selected service type
          data = await getPrestationsWithImages(selectedService);
        }
  
        console.log("Données reçues :", data);
        setPrestations(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des prestations", error);
      }
    }
  
    fetchPrestations();
  }, [selectedService]);

  const filteredPrestations =
    selectedService === "ALL"
      ? Array.isArray(prestations)
        ? prestations
        : []
      : prestations.filter(
          (prestation) => prestation.service.type === selectedService
        );

  const imagesPerRow = 3; // Adjust based on your grid configuration
  const visibleImages = visibleRows * imagesPerRow;
  const visibleFilteredImages = filteredPrestations.flatMap((prestation) => prestation.images).slice(0, visibleImages);

  return (
    <div className="min-h-screen bg-cover p-8 bg-green-30">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
        GALERIE
      </h1>

      <div className="flex justify-center flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedService("ALL")}
          className={`px-4 py-2 text-sm sm:text-base rounded-md ${
            selectedService === "ALL"
              ? "bg-green text-white"
              : "bg-white text-green"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setSelectedService("TATOUAGE")}
          className={`px-4 py-2 text-sm sm:text-base rounded-md ${
            selectedService === "TATOUAGE"
              ? "bg-green text-white"
              : "bg-white text-green"
          }`}
        >
          Tatouage
        </button>
        <button
          onClick={() => setSelectedService("FLASH_TATTOO")}
          className={`px-4 py-2 text-sm sm:text-base rounded-md ${
            selectedService === "FLASH_TATTOO"
              ? "bg-green text-white"
              : "bg-white text-green"
          }`}
        >
          Flash Tattoo
        </button>
        <button
          onClick={() => setSelectedService("ONGLERIE")}
          className={`px-4 py-2 text-sm sm:text-base rounded-md ${
            selectedService === "ONGLERIE"
              ? "bg-green text-white"
              : "bg-white text-green"
          }`}
        >
          Ongles
        </button>
      </div>

      {visibleFilteredImages.length === 0 ? (
        <div className="text-center text-gray-500 text-xl">
          Aucune image disponible pour cette catégorie.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFilteredImages.map((image, index) => (
            <div
              key={index}
              className="relative w-full pb-[100%] bg-gray-200 rounded-md overflow-hidden"
            >
              <Image
                src={image.url}
                alt={`Image ${image.id}`}
                fill
                className="absolute inset-0 object-cover w-full h-full"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}

      {visibleImages < filteredPrestations.flatMap((p) => p.images).length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleRows((prev) => prev + 2)}
            className="px-6 py-3 bg-green text-white rounded-md"
          >
            Voir Plus
          </button>
        </div>
      )}
    </div>
  );
}

