// lib/uploadImage.ts

import { Formidable, Fields, Files, File } from 'formidable';
import { z } from 'zod';
import { ServiceType } from '@prisma/client';
import { promises as fs } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

// Schéma de validation pour la prestation
const prestationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  duration: z.number().min(1, 'La durée doit être positive'),
  price: z.number().min(0, 'Le prix doit être positif'),
  description: z.string(),
  serviceType: z.nativeEnum(ServiceType),
});

// Fonction d'aide pour extraire une chaîne unique
const getFirst = (field: string | string[] | undefined): string => {
  if (Array.isArray(field)) {
    return field[0];
  }
  return field || '';
};

// Fonction pour traiter le formulaire
export const processPrestationForm = async (request: Request) => {
  const form = new Formidable({ multiples: true, keepExtensions: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fields, files] = await form.parse(request as any) as [Fields, Files];

  // Extraire et convertir les champs
  const name = getFirst(fields.name);
  const duration = Number(getFirst(fields.duration));
  const price = Number(getFirst(fields.price));
  const description = getFirst(fields.description);
  const serviceType = getFirst(fields.serviceType);

  // Valider les données textuelles avec Zod
  const prestationData = prestationSchema.parse({
    name,
    duration,
    price,
    description,
    serviceType,
  });

  // Recherche du service en fonction du type
  const service = await db.service.findUnique({
    where: {
      type: prestationData.serviceType,
    },
  });

  if (!service) {
    throw new Error(`Le type de service ${prestationData.serviceType} est introuvable.`);
  }

  // Traitement des fichiers d'images
  const images = Array.isArray(files.image) ? files.image : [files.image];
  const imageUrls: string[] = [];

  for (const image of images) {
    if (image instanceof File) {
      const originalFilename = image.originalFilename || 'unknown.jpg';
      const filepath = image.filepath;

      // Définir le répertoire de destination en fonction du serviceType
      const serviceDir = join(process.cwd(), 'public/img', prestationData.serviceType);

      // Créer le répertoire s'il n'existe pas
      await fs.mkdir(serviceDir, { recursive: true });

      // Définir un nom de fichier unique
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = originalFilename.split('.').pop() || 'jpg'; // Par défaut jpg si aucune extension
      const fileName = `${uniqueSuffix}.${fileExtension}`;
      const newPath = join(serviceDir, fileName);

      // Déplacer le fichier vers le répertoire du service
      await fs.rename(filepath, newPath);

      // Construire l'URL relative
      const imageUrl = `/img/${prestationData.serviceType}/${fileName}`;
      imageUrls.push(imageUrl);
    }
  }

  return { prestationData, service, imageUrls };
};
