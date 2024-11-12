import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { addMonths, eachDayOfInterval, format, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function POST(req: Request) {
  try {
    const { salon } = await req.json();

    // Supprimer tous les horaires existants pour ce salon (optionnel si vous voulez réinitialiser complètement)
    await db.openingHours.deleteMany({
      where: { salon }
    });

    // Générer les dates pour les 6 prochains mois
    const startDate = new Date();
    const endDate = addMonths(startDate, 6);
    
    const days = eachDayOfInterval({
      start: startOfDay(startDate),
      end: endOfDay(endDate)
    });

    // Créer les horaires pour chaque jour
    const hoursData = days.map(date => {
      const jour = format(date, 'EEEE', { locale: fr }).toLowerCase(); // 'lundi', 'mardi', etc.
      const isClosed = jour === 'dimanche'; // Exemple : fermé le dimanche
      
      return {
        salon,
        jour,
        date, // Gardez `date` en format Date si le modèle le permet
        startTime: "09:00",
        endTime: "19:00",
        isClosed
      };
    });

    // Créer les horaires dans la base de données
    const result = await db.openingHours.createMany({
      data: hoursData
    });

    return NextResponse.json({ 
      message: "Horaires initialisés avec succès",
      count: result.count 
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation des horaires :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
