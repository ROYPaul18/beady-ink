// lib/uploadImage.ts
import { Formidable, Fields, Files, File } from 'formidable';
import { z } from 'zod';
import { ServiceType } from '@prisma/client';
import { promises as fs } from 'fs';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

// Schéma de validation pour la prestation
const prestationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  duration: z.number().min(1, 'La durée doit être positive'),
  price: z.number().min(0, 'Le prix doit être positif'),
  description: z.string(),
  serviceType: z.nativeEnum(ServiceType),
});

// Fonction pour traiter le formulaire
export const processPrestationForm = async (req: Request) => {
  const form = new Formidable({ multiples: true, keepExtensions: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const incomingMessage = req as any; // Cast pour le traitement avec Formidable

  const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(incomingMessage, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const name = fields.name?.toString() || '';
  const duration = parseInt(fields.duration?.toString() || '0', 10);
  const description = fields.description?.toString() || '';
  const price = parseFloat(fields.price?.toString() || '0');
  const serviceType = fields.serviceType?.toString() || '';

  // Valider les données avec Zod
  const prestationData = prestationSchema.parse({
    name,
    duration,
    price,
    description,
    serviceType,
  });

  const service = await db.service.findUnique({
    where: {
      type: prestationData.serviceType,
    },
  });

  if (!service) {
    throw new Error(`Le type de service ${prestationData.serviceType} est introuvable.`);
  }

  return { prestationData, service, files };
};

// Fonction pour uploader une image sur Cloudinary
export const uploadImageToCloudinary = async (file: File, folder: string): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await fs.readFile(file.filepath);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Limite la taille de l'image à 800x800 pixels
          { quality: 'auto:eco', fetch_format: 'auto' }, // Optimisation automatique de la qualité
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );
    uploadStream.end(buffer);
  });

  // Supprimer le fichier temporaire après téléchargement
  await fs.unlink(file.filepath);

  return result.secure_url;
};
