// Importation de PrismaClient et des enums directement depuis Prisma
import { ServiceType } from "@prisma/client";

// Type pour une prestation
export interface Prestation {
  id: number;
  name: string;
  duration: number;
  description: string;
  price: number;
  serviceId: number;
  images: { id: number; url: string; prestationId: number }[]; // Ajout des images associées
  createdAt: Date;
  updatedAt: Date;
}

interface Image {
  id: number;
  url: string;
  prestationId: number; // clé étrangère qui lie l'image à la prestation
}

// Type pour une prestation avec ses images et son service associé
export interface PrestationWithImages {
  id: number;
  name: string;
  duration: number;
  description: string;
  price: number;
  serviceId: number;
  images: { 
    url: string; 
    id: number; 
    createdAt: Date; 
    prestationId: number; 
  }[];
  service: {
    id: number;
    type: ServiceType;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Type pour les données de création de prestation
export type CreatePrestationData = Omit<Prestation, 'id' | 'createdAt' | 'updatedAt'>;

// Type pour le formulaire de création de prestation
export type PrestationFormData = {
  name: string;
  duration: string; // On utilise string car les inputs HTML renvoient des strings
  description: string;
  price: string;
  imageUrl: string;
  serviceType: ServiceType;
};

// Type pour un service
export type Service = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  type: ServiceType;
};

// Type pour les données de création d'un service
export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

// Type pour le formulaire de création de service
export type ServiceFormData = {
  type: string;
};

// Type pour une réservation avec informations utilisateur
export interface ReservationWithUser {
  id: number;
  date: Date;
  salon: string;
  status?: string; // Si ce champ est facultatif
  user: {
    id: number;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
