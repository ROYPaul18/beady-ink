'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import { PrestationWithImages } from "@/lib/types";
import { ServiceType } from "@prisma/client";

async function getPrestationsWithImages(): Promise<PrestationWithImages[]> {
  const response = await fetch("/api/prestation");
  if (!response.ok) throw new Error("Erreur lors de la récupération des prestations");
  return response.json();
}

export default function Gallery() {
  const [prestations, setPrestations] = useState<PrestationWithImages[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType | "ALL">("ALL");

  useEffect(() => {
    async function fetchPrestations() {
      try {
        const data = await getPrestationsWithImages();
        setPrestations(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des prestations", error);
      }
    }

    fetchPrestations();
  }, []);

  const filteredPrestations =
    selectedService === "ALL"
      ? prestations
      : prestations.filter((prestation) => prestation.service.type === selectedService);

  return (
    <div className="min-h-screen bg-cover p-8 bg-green-30">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
        GALERIE
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedService("TATOUAGE")}
          className={`px-4 py-2 rounded-md ${
            selectedService === "TATOUAGE" ? "bg-green text-white" : "bg-white text-green"
          }`}
        >
          Tatouage
        </button>
        <button
          onClick={() => setSelectedService("FLASH_TATTOO")}
          className={`px-4 py-2 rounded-md ${
            selectedService === "FLASH_TATTOO" ? "bg-green text-white" : "bg-white text-green"
          }`}
        >
          Flash Tattoo
        </button>
        <button
          onClick={() => setSelectedService("ONGLERIE")}
          className={`px-4 py-2 rounded-md ${
            selectedService === "ONGLERIE" ? "bg-green text-white" : "bg-white text-green"
          }`}
        >
          Ongles
        </button>
        <button
          onClick={() => setSelectedService("ALL")}
          className={`px-4 py-2 rounded-md ${
            selectedService === "ALL" ? "bg-green text-white" : "bg-white text-green"
          }`}
        >
          Tous
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrestations.map((prestation) =>
          prestation.images.map((image) => (
            <div key={image.id} className="relative h-80 bg-gray-200 rounded-md overflow-hidden">
              <Image
                src={image.url}
                alt={prestation.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
