// lib/types.ts
import { ServiceType, OnglerieCategory } from "@prisma/client";

export interface Prestation {
  id: number;
  name: string;
  duration: number;
  description: string;
  price: number;
  serviceId: number;
  category?: OnglerieCategory | null; // La propriété est optionnelle
  images: { id: number; url: string; prestationId: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrestationWithImages {
  id: number;
  name: string;
  duration: number;
  description: string;
  price: number;
  serviceId: number;
  category?: OnglerieCategory | null;
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

export type CreatePrestationData = Omit<Prestation, 'id' | 'createdAt' | 'updatedAt'>;

export type PrestationFormData = {
  name: string;
  duration: string;
  description: string;
  price: string;
  imageUrl: string;
  serviceType: ServiceType;
  category?: OnglerieCategory;
};

export type Service = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  type: ServiceType;
};

export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

export type ServiceFormData = {
  type: string;
};

export interface ReservationWithUser {
  id: number;
  date: Date;
  salon: string;
  status?: string;
  service: { id: number; type: ServiceType };
  prestations: PrestationWithImages[];
  user: {
    id: number;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
// lib/types.ts
export interface FlashTattooRequestWithUser {
  id: number;
  healthData: { [key: string]: string };
  user: {
    nom: string;
    phone: string;
  };
  flashTattooId: number;
}


export interface OpeningHour {
  id: number;
  salon: string;
  jour: string;
  startTime: string | null;
  endTime: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isClosed: boolean;
}


export interface TattooRequestWithUser {
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
