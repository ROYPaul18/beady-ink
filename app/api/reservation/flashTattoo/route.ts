import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      console.error("Erreur: Utilisateur non autorisé ou session manquante");
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const userEmail = session.user.email as string;

    // Récupérer l'utilisateur pour obtenir son ID
    const user = await db.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      console.error("Utilisateur non trouvé");
      return NextResponse.json({ message: 'Utilisateur non autorisé' }, { status: 401 });
    }

    const userId = user.id;

    // Récupération des données du corps de la requête
    const body = await req.json();
    const { flashTattooId, healthData } = body;

    // Vérification des données
    if (!flashTattooId || !healthData) {
      console.error("Erreur: Flash tattoo ID ou données de santé manquantes");
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    // Récupérer les données du flash tattoo
    const flashTattoo = await db.prestation.findUnique({
      where: { id: flashTattooId },
      include: { service: true }, // Inclure le service lié au flash tattoo
    });

    if (!flashTattoo || !flashTattoo.service) {
      console.error("Erreur: Flash tattoo ou service non trouvé");
      return NextResponse.json({ message: 'Flash tattoo ou service non trouvé' }, { status: 400 });
    }

    // Récupérer le serviceId
    const serviceId = flashTattoo.service.id;

    console.log("Service ID trouvé:", serviceId);

    // Vérifier si db.flashTattooRequest est disponible avant d'appeler .create()
    console.log("db.flashTattooRequest:", db.flashTattooRequest);
    console.log("db.flashTattooRequest.create:", db.flashTattooRequest?.create);

    // Créer la demande de flash tattoo
    const flashTattooRequest = await db.flashTattooRequest.create({
      data: {
        user: { connect: { id: userId } },
        service: { connect: { id: serviceId } },
        flashTattooId,
        healthData,
      },
    });

    console.log("Demande de flash tattoo créée:", flashTattooRequest);

    return NextResponse.json(
      {
        success: true,
        message: 'Demande de flash tattoo créée avec succès',
        flashTattooRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la demande de flash tattoo:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la création de la demande de flash tattoo',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

