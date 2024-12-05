"use client";

import React, { useEffect, useState } from "react";
import Review from "./Review";

interface ReviewType {
  id: number;
  rating: number;
  comment: string;
  user: {
    nom: string;
  };
  prestation?: {
    name: string;
  };
}

const ReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/review`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Erreur lors de la récupération des avis");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des avis :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 text-lg">
        Chargement des avis...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          Aucun avis disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <Review
              key={review.id}
              rating={review.rating}
              comment={review.comment}
              user={review.user}
              prestationName={review.prestation?.name || "Non spécifié"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
