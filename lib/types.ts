// lib/types.ts

import { ServiceType } from "@prisma/client";

export interface Prestation {
  id: number;
  name: string;
  duration: number;
  description: string;
  price: number;
  serviceId: number;
  images: { id: number; url: string; prestationId: number }[];
  createdAt: Date;
  updatedAt: Date;
}

interface Image {
  id: number;
  url: string;
  prestationId: number;
}

// lib/types.ts

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
  service: { // `service` est rendu obligatoire ici
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
