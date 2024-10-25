import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { ServiceType } from '@prisma/client';
import { Readable } from 'stream';
import cloudinary from '@/lib/cloudinary';

// Schéma de validation pour la prestation
const prestationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  duration: z.preprocess((val) => val === '' ? undefined : val, z.number().min(1, 'La durée doit être positive')).optional(),
  price: z.preprocess((val) => val === '' ? undefined : val, z.number().min(0, 'Le prix doit être positif')).optional(),
  description: z.string().optional(),
  serviceType: z.nativeEnum(ServiceType),
}).refine((data) => {
  if (data.serviceType === ServiceType.ONGLERIE) {
    return data.name && data.duration !== undefined && data.description && data.price !== undefined;
  }
  if (data.serviceType === ServiceType.FLASH_TATTOO) {
    return data.price !== undefined;
  }
  return true; // Aucune condition pour TATOUAGE
}, {
  message: 'Certains champs requis sont manquants pour ce type de prestation.',
});

// Fonction pour convertir un fichier en ReadableStream pour Cloudinary
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Fonction pour uploader une image sur Cloudinary
const uploadImageToCloudinary = async (buffer: Buffer, folder: string): Promise<string> => {
  const stream = bufferToStream(buffer);
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:eco', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    stream.pipe(uploadStream);
  });
};

// Désactiver le body parser pour gérer le multipart/form-data
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }

    // Lire le contenu de la requête en tant que FormData
    const formData = await req.formData();
    const fields: Record<string, string | File> = {};
    const images: Buffer[] = [];

    // Parcourir les champs de FormData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        images.push(buffer);
      } else {
        fields[key] = value as string; // Cast en tant que string
      }
    }

    // Valider les données avec Zod en fonction du type de service
    const prestationData = prestationSchema.parse({
      name: fields.name || undefined,
      duration: fields.duration ? Number(fields.duration) : undefined,
      price: fields.price ? Number(fields.price) : undefined,
      description: fields.description || undefined,
      serviceType: fields.serviceType as ServiceType,
    });

    // Rechercher le service correspondant
    const service = await db.service.findUnique({
      where: { type: prestationData.serviceType },
    });

    if (!service) {
      return NextResponse.json({ message: `Service introuvable pour le type ${prestationData.serviceType}` }, { status: 404 });
    }

    // Uploader les images sur Cloudinary et récupérer les URLs
    const imageUrls: string[] = [];
    for (const imageBuffer of images) {
      const imageUrl = await uploadImageToCloudinary(imageBuffer, `prestation/${service.type}`);
      imageUrls.push(imageUrl);
    }

    // Créer la prestation dans la base de données avec les images associées
    const newPrestation = await db.prestation.create({
      data: {
        name: prestationData.name || '', // Nom facultatif pour certains types
        duration: prestationData.duration || 0, // Durée facultative
        price: prestationData.price || 0, // Prix facultatif
        description: prestationData.description || '', // Description facultative
        serviceId: service.id,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({ prestation: newPrestation, message: 'Prestation ajoutée avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la prestation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation des données échouée', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erreur lors de la création de la prestation' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    // Vérifiez que l'ID est bien fourni
    if (!id) {
      return NextResponse.json({ message: 'ID manquant' }, { status: 400 });
    }

    // Convertir l'ID en nombre
    const prestationId = parseInt(id, 10);
    if (isNaN(prestationId)) {
      return NextResponse.json({ message: 'ID invalide' }, { status: 400 });
    }

    const prestation = await db.prestation.findUnique({
      where: { id: prestationId },
      include: { images: true },
    });

    if (!prestation) {
      return NextResponse.json({ message: 'Prestation introuvable' }, { status: 404 });
    }

    // Supprimer les images de Cloudinary
    for (const image of prestation.images) {
      const publicId = extractPublicIdFromUrl(image.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Supprimer la prestation de la base de données
    await db.prestation.delete({
      where: { id: prestationId },
    });

    return NextResponse.json({ message: 'Prestation et images supprimées avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de la prestation:', error);
    return NextResponse.json({ message: 'Erreur lors de la suppression de la prestation' }, { status: 500 });
  }
}

// Fonction pour extraire l'ID public de Cloudinary à partir de l'URL de l'image
const extractPublicIdFromUrl = (url: string): string | null => {
  const matches = url.match(/\/(?:v\d+\/)?([^/]+)\.\w+$/);
  return matches ? matches[1] : null;
};

export async function GET() {
  try {
    const prestations = await db.prestation.findMany({
      include: {
        images: true,
        service: true,
      },
    });
    return NextResponse.json(prestations);
  } catch (error) {
    console.error("Erreur lors de la récupération des prestations:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des prestations" }, { status: 500 });
  }
}
