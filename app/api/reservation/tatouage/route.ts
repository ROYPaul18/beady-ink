import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ServiceType } from '@prisma/client';
import cloudinary from '@/lib/cloudinary';

// Fonction pour télécharger l'image vers Cloudinary à partir d'un base64
const uploadImageToCloudinary = async (base64Image: string, folder: string): Promise<string> => {
  const buffer = Buffer.from(base64Image.split(',')[1], 'base64'); // Extraire le contenu binaire de l'image

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
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
    ).end(buffer); // Fin du téléchargement
  });
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const userEmail = session.user.email as string;
    const user = await db.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();
    const { availability, size, placement, referenceImages, healthData } = body;

    const tattooService = await db.service.findUnique({
      where: { type: ServiceType.TATOUAGE },
    });

    if (!tattooService) {
      return NextResponse.json({ message: 'Service de tatouage non disponible' }, { status: 400 });
    }

    const uploadedImageUrls: string[] = [];
    if (referenceImages && referenceImages.length > 0) {
      for (const base64Image of referenceImages) {
        const imageUrl = await uploadImageToCloudinary(base64Image, 'prestation/TATOUAGE/Inspiration');
        uploadedImageUrls.push(imageUrl);
      }
    }

    const tattooRequest = await db.tattooRequest.create({
      data: {
        user: { connect: { id: userId } },
        service: { connect: { id: tattooService.id } },
        availability,
        size,
        placement,
        referenceImages: uploadedImageUrls,
        healthData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Demande de tatouage créée avec succès',
      tattooRequest,
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la demande de tatouage:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la création de la demande de tatouage',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userEmail = session.user.email as string;

    const user = await db.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 401 });
    }

    const tattooRequests = await db.tattooRequest.findMany({
      where: { userId: user.id },
      include: {
        service: true, // Inclure le service lié au tatouage
      },
    });

    return NextResponse.json({ success: true, tattooRequests });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de tatouage :", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}