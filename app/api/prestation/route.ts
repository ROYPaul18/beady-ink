import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '@/lib/db';
import { z } from 'zod';
import { ServiceType } from '@prisma/client';
import { promises as fs } from 'fs';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Désactiver le body parser de Next.js pour permettre à formidable de gérer le parsing du formulaire
export const config = {
  api: {
    bodyParser: false,
  },
};

// Définir une interface pour l'objet File côté serveur
interface ServerFile {
  filepath: string;
  originalFilename?: string;
  newFilename?: string;
  mimetype?: string;
  size?: number;
}

const parseForm = async (req: Request) => {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Type de contenu invalide');
  }

  const formData = await req.formData();
  const fields: Record<string, string> = {};
  const files: Record<string, ServerFile> = {};

  formData.forEach((value, key) => {
    if (typeof value === 'object' && 'filepath' in value) {
      // Utilisation d'une assertion de type plus sûre
      const fileValue = value as Partial<ServerFile>;
      if (fileValue.filepath) {
        files[key] = {
          filepath: fileValue.filepath,
          originalFilename: fileValue.originalFilename,
          newFilename: fileValue.newFilename,
          mimetype: fileValue.mimetype,
          size: fileValue.size,
        };
      }
    } else {
      fields[key] = value.toString();
    }
  });

  return { fields, files };
};

// Fonction utilitaire pour obtenir la première valeur d'un champ
const getFirst = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
};

export async function POST(req: Request) {
  try {
    // Parse le formulaire et récupère les champs et fichiers
    const { fields, files } = await parseForm(req);
    const name = getFirst(fields.name);
    const duration = parseInt(getFirst(fields.duration), 10);
    const description = getFirst(fields.description);
    const price = parseFloat(getFirst(fields.price));
    const serviceType = getFirst(fields.serviceType);

    // Conversion de la string en enum ServiceType
    const serviceTypeEnum = ServiceType[serviceType as keyof typeof ServiceType];
    if (!serviceTypeEnum) {
      return NextResponse.json({ message: 'Type de service invalide' }, { status: 400 });
    }

    // Valider les données avec zod
    const prestationSchema = z.object({
      name: z.string().min(1, 'Le nom est requis'),
      duration: z.number().min(1, 'La durée doit être positive'),
      description: z.string().min(1, 'La description est requise'),
      price: z.number().min(0, 'Le prix doit être positif'),
      serviceType: z.nativeEnum(ServiceType),
    });

    const prestationData = prestationSchema.parse({
      name,
      duration,
      description,
      price,
      serviceType: serviceTypeEnum,
    });

    // Récupérer le service associé dans la base de données
    const service = await db.service.findUnique({
      where: { type: prestationData.serviceType },
    });

    if (!service) {
      return NextResponse.json({ message: `Service introuvable pour le type ${prestationData.serviceType}` }, { status: 404 });
    }

    // Gestion des fichiers d'images
    const imageFile = files.image;
    const imageUrls: string[] = [];

    if (imageFile) {
      // Lire le fichier depuis le système de fichiers
      const buffer = await fs.readFile(imageFile.filepath);

      // Uploader l'image sur Cloudinary
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `prestation/${service.type}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        );
        uploadStream.end(buffer);
      });

      imageUrls.push(uploadResult.secure_url);

      // Optionnellement, supprimer le fichier temporaire
      await fs.unlink(imageFile.filepath);
    }

    // Créer la prestation dans la base de données avec les images associées
    const newPrestation = await db.prestation.create({
      data: {
        name: prestationData.name,
        duration: prestationData.duration,
        price: prestationData.price,
        description: prestationData.description,
        serviceId: service.id,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    // Retourner la réponse avec la prestation créée
    return NextResponse.json({ prestation: newPrestation, message: 'Prestation ajoutée avec succès' }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de la prestation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation des données échouée', errors: error.errors }, { status: 400 });
    }

    return NextResponse.json({ message: 'Erreur lors de la création de la prestation' }, { status: 500 });
  }
}

// Ajoutez cette fonction pour gérer la suppression d'une prestation
export async function DELETE(req: Request) {
  try {
    // Récupérer l'ID de la prestation à supprimer depuis l'URL
    const url = new URL(req.url);
    const idString = url.searchParams.get('id');

    if (!idString) {
      return NextResponse.json({ message: 'ID de la prestation requis' }, { status: 400 });
    }

    // Convertir l'ID en number
    const id = parseInt(idString, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de la prestation invalide' }, { status: 400 });
    }

    // Vérifier si la prestation existe
    const prestation = await db.prestation.findUnique({ where: { id } });

    if (!prestation) {
      return NextResponse.json({ message: 'Prestation introuvable' }, { status: 404 });
    }

    // Supprimer la prestation
    await db.prestation.delete({ where: { id } });

    return NextResponse.json({ message: 'Prestation supprimée avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la prestation:', error);
    return NextResponse.json({ message: 'Erreur lors de la suppression de la prestation' }, { status: 500 });
  }
}

