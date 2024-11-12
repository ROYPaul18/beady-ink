import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const id = parseInt(params.id);

    // Remove fields that shouldn't be updated
    const { 
      id: _id,
      createdAt: _createdAt,
      ...updateData 
    } = data;

    const result = await db.openingHours.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ 
      message: "Horaires mis à jour avec succès",
      result: {
        ...result,
        jour: result.jour.charAt(0).toUpperCase() + result.jour.slice(1),
        startTime: result.startTime,
        endTime: result.endTime
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'horaire :", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await db.openingHours.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Horaires supprimés avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'horaire :", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" }, 
      { status: 500 }
    );
  }
}
