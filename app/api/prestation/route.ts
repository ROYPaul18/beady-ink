import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { ServiceType } from '@prisma/client';
import { Readable } from 'stream';
import cloudinary from '@/lib/cloudinary';

// Schéma de validation pour la prestation
const prestationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  duration: z.number().min(1, 'La durée doit être positive'),
  price: z.number().min(0, 'Le prix doit être positif'),
  description: z.string(),
  serviceType: z.nativeEnum(ServiceType),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: Record<string, any> = {};
    const images: Buffer[] = [];

    // Parcourir les champs de FormData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        images.push(buffer);
      } else {
        fields[key] = value;
      }
    }

    // Valider les données avec Zod
    const prestationData = prestationSchema.parse({
      name: fields.name,
      duration: Number(fields.duration),
      price: Number(fields.price),
      description: fields.description,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ prestation: newPrestation, message: 'Prestation ajoutée avec succès' }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {

    console.error('Erreur lors de la création de la prestation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation des données échouée', errors: error.errors }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Convertir l'ID en nombre (si nécessaire, selon votre modèle)
    const prestationId = parseInt(id, 10);

    if (isNaN(prestationId)) {
      return NextResponse.json({ message: 'ID invalide' }, { status: 400 });
    }

    // Récupérer la prestation et ses images avant de la supprimer
    const prestation = await db.prestation.findUnique({
      where: { id: prestationId },
      include: { images: true },
    });

    if (!prestation) {
      return NextResponse.json({ message: 'Prestation introuvable' }, { status: 404 });
    }

    // Supprimer les images associées de Cloudinary
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
