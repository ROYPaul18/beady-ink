import { ServiceType, OnglerieCategory } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import type { ForwardedRef } from 'react';

// Prestations Types
export interface Prestation {
  id: number;
  name: string;
  duration: number;
  description: string;
  price: number;
  serviceId: number;
  category?: OnglerieCategory | null;
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

// Service Types
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

// Reservation Types
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
    telephone?:string;
    nom?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Flash Tattoo Types
export interface FlashTattooRequestWithUser {
  id: number;
  healthData: { [key: string]: string };
  user: {
    nom: string;
    phone: string;
  };
  flashTattooId: number;
  // imageUrl: string[];
}

// Tattoo Request Types
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

// Opening Hours Types
export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface TimeSlot extends TimeRange {
  id?: number;
  isAvailable?: boolean;
  openingHoursId?: number;
}

export interface Break extends TimeRange {
  id?: number;
}

export interface BaseOpeningHour {
  salon: string;
  jour: string;
  date: Date;
  isClosed: boolean;
  weekKey?: string | null;
}

export interface RawOpeningHour extends BaseOpeningHour {
  id: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpeningHour extends BaseOpeningHour {
  id?: number | null;
  timeSlots: TimeSlot[];   // Créneaux horaires
  startTime?: string | null; // Ajoutez ces propriétés
  endTime?: string | null;   // pour correspondre au code.
}


// Component Props Types
export interface OpeningHoursEditorProps {
  initialHours: OpeningHour[];
  salon: string;
}

export interface EditHoursModalProps {
  editingDay: string | null;
  getCurrentWeekDays: () => WeekDay[];
  hours: OpeningHour[];
  setHours: Dispatch<SetStateAction<OpeningHour[]>>;
  closeModal: () => void;
  saveDayChanges: (selectedDaySalon: string, date: Date, updatedHours?: Partial<OpeningHour>) => Promise<void>;
  selectedSalon: string | null;
  // fetchHoursForSalon: (salon: string) => Promise<void>;
  
}

export interface WeekDay {
  date: Date;
  formattedDate: string;
  dayName: string;
  weekKey: string;
}

// Utility Functions
export const transformRawOpeningHour = (raw: RawOpeningHour): OpeningHour => {
  const defaultTimeSlots: TimeSlot[] = raw.isClosed
    ? []
    : [
        {
          startTime: "09:00",
          endTime: "12:00",
          isAvailable: true,
        },
        {
          startTime: "14:00",
          endTime: "19:00",
          isAvailable: true,
        },
      ];

  const defaultBreak: Break = {
    startTime: "12:00",
    endTime: "14:00",
  };

  return {
    id: raw.id,
    salon: raw.salon,
    jour: raw.jour,
    date: raw.date,
    isClosed: raw.isClosed,
    weekKey: raw.weekKey,
    timeSlots: defaultTimeSlots,
  };
};

// Helper Types
export type WeeklyAvailability = {
  [key: string]: OpeningHour[];
};

export type OpeningHoursApiResponse = {
  [date: string]: RawOpeningHour;
};

export type WeeklyOpeningHoursResponse = {
  selectedWeeks: string[];
  openingHours: OpeningHoursApiResponse;
};

export interface WeeklyTimeSlotSelectorProps {
  salon: string;
  durationInMinutes: number;
  onSelect: (date: string, time: string) => void;
}

export interface WeeklyTimeSlotSelectorRef {
  refreshTimeSlots: () => void;
}

export interface WeeklyTimeSlotSelectorComponentProps extends WeeklyTimeSlotSelectorProps {
  ref?: ForwardedRef<WeeklyTimeSlotSelectorRef>;
}
