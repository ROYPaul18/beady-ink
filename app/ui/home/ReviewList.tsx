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
  prestation: {
    name: string;
  };
}

const ReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Erreur lors de la récupération des avis");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des avis :", error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.map((review) => (
        <Review
          key={review.id}
          rating={review.rating}
          comment={review.comment}
          user={review.user}
          prestationName={review.prestation.name}
        />
      ))}
    </div>
  );
};

export default ReviewList;
