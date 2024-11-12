import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface WeekToggleRequest {
  weekKey: string;
  salonSoye: boolean;
}

// Récupération des semaines sélectionnées pour un salon spécifique
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salon = searchParams.get('salon');

    if (!salon) {
      return NextResponse.json(
        { message: "Le salon est requis", success: false },
        { status: 400 }
      );
    }

    const openingHours = await db.openingHours.findMany({
      where: {
        salon,
        isClosed: false
      }
    });

    const selectedWeeks = openingHours.map(hour => hour.jour);
    console.log("Semaines récupérées:", selectedWeeks);

    return NextResponse.json({
      success: true,
      selectedWeeks
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}

// Mise à jour ou création des horaires hebdomadaires
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log('Données reçues:', body);

    const { weekKey, salonSoye } = body as WeekToggleRequest;

    if (!weekKey) {
      return NextResponse.json(
        { message: "La semaine est requise", success: false },
        { status: 400 }
      );
    }

    if (typeof salonSoye !== 'boolean') {
      return NextResponse.json(
        { message: "salonSoye doit être un booléen", success: false },
        { status: 400 }
      );
    }

    // Mise à jour ou création de l'horaire pour Soye en septaine
    const existingSoye = await db.openingHours.findFirst({
      where: {
        salon: 'Soye en septaine',
        jour: weekKey
      }
    });

    if (existingSoye) {
      await db.openingHours.update({
        where: { id: existingSoye.id },
        data: { isClosed: !salonSoye }
      });
    } else {
      await db.openingHours.create({
        data: {
          salon: 'Soye en septaine',
          jour: weekKey,
          isClosed: !salonSoye,
          startTime: '09:00',
          endTime: '18:00'
        }
      });
    }

    // Mise à jour ou création de l'horaire pour Flavigny
    const existingFlavigny = await db.openingHours.findFirst({
      where: {
        salon: 'Flavigny',
        jour: weekKey
      }
    });

    if (existingFlavigny) {
      await db.openingHours.update({
        where: { id: existingFlavigny.id },
        data: { isClosed: salonSoye }
      });
    } else {
      await db.openingHours.create({
        data: {
          salon: 'Flavigny',
          jour: weekKey,
          isClosed: salonSoye,
          startTime: '09:00',
          endTime: '18:00'
        }
      });
    }

    console.log(`Mise à jour réussie pour la semaine ${weekKey}: Soye ${salonSoye ? 'ouvert' : 'fermé'}, Flavigny ${salonSoye ? 'fermé' : 'ouvert'}`);
    return NextResponse.json({
      success: true,
      message: "Horaires mis à jour avec succès",
      data: { weekKey, salonSoye }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des horaires:', error);
    return NextResponse.json(
      { 
        message: "Erreur lors de la mise à jour des horaires",
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

// Suppression des horaires d'un salon spécifique pour un jour donné
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const salon = searchParams.get('salon');
    const jour = searchParams.get('jour');

    if (!salon || !jour) {
      return NextResponse.json(
        { message: "Le salon et le jour sont requis" },
        { status: 400 }
      );
    }

    await db.openingHours.deleteMany({
      where: {
        salon,
        jour: jour.toLowerCase()
      }
    });

    console.log(`Horaires supprimés pour le salon ${salon} le jour ${jour}`);
    return NextResponse.json({
      message: "Horaires supprimés avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des horaires :", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
}
