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
  return true;
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

// Fonction pour extraire l'ID public de Cloudinary à partir de l'URL de l'image
const extractPublicIdFromUrl = (url: string): string | null => {
  const matches = url.match(/\/(?:v\d+\/)?([^/]+)\.\w+$/);
  return matches ? matches[1] : null;
};

// Désactiver le body parser pour gérer le multipart/form-data
export const runtime = 'nodejs';

// Handler pour la création d'une prestation
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
    }

    const formData = await req.formData();
    const fields: Record<string, string | File> = {};
    const images: Buffer[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        images.push(buffer);
      } else {
        fields[key] = value as string;
      }
    }

    const prestationData = prestationSchema.parse({
      name: fields.name || undefined,
      duration: fields.duration ? Number(fields.duration) : undefined,
      price: fields.price ? Number(fields.price) : undefined,
      description: fields.description || undefined,
      serviceType: fields.serviceType as ServiceType,
    });

    const result = await db.$transaction(async (tx) => {
      const service = await tx.service.findUnique({
        where: { type: prestationData.serviceType },
      });

      if (!service) {
        throw new Error(`Service introuvable pour le type ${prestationData.serviceType}`);
      }

      const imageUrls: string[] = [];
      for (const imageBuffer of images) {
        const imageUrl = await uploadImageToCloudinary(imageBuffer, `prestation/${service.type}`);
        imageUrls.push(imageUrl);
      }

      return await tx.prestation.create({
        data: {
          name: prestationData.name || '',
          duration: prestationData.duration || 0,
          price: prestationData.price || 0,
          description: prestationData.description || '',
          serviceId: service.id,
          images: {
            create: imageUrls.map((url) => ({ url })),
          },
        },
        include: { images: true },
      });
    });

    return NextResponse.json(
      { prestation: result, message: 'Prestation ajoutée avec succès' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la prestation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation des données échouée', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur lors de la création de la prestation' },
      { status: 500 }
    );
  }
}

// Handler pour la suppression d'une prestation
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID manquant' }, { status: 400 });
    }

    const prestationId = parseInt(id, 10);
    if (isNaN(prestationId)) {
      return NextResponse.json({ message: 'ID invalide' }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      const prestation = await tx.prestation.findUnique({
        where: { id: prestationId },
        include: { images: true },
      });

      if (!prestation) {
        throw new Error('Prestation introuvable');
      }

      for (const image of prestation.images) {
        const publicId = extractPublicIdFromUrl(image.url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      await tx.prestation.delete({
        where: { id: prestationId },
      });
    });

    return NextResponse.json(
      { message: 'Prestation et images supprimées avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la prestation:', error);
    
    if (error instanceof Error && error.message === 'Prestation introuvable') {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la prestation' },
      { status: 500 }
    );
  }
}

// Handler pour la récupération des prestations (sans pagination)
export async function GET(req: Request) {
  console.log('Début de la fonction GET /api/prestation');
  try {
    const prestations = await db.prestation.findMany({
      include: {
        images: {
          select: {
            url: true,
          },
        },
        service: {
          select: {
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Nombre de prestations récupérées : ${prestations.length}`);
    return NextResponse.json(prestations);
  } catch (error) {
    console.error("Erreur lors de la récupération des prestations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des prestations" },
      { status: 500 }
    );
  }
}
