import prisma from '../lib/prisma';
import { HOARating, RatingValue } from '@prisma/client';

export interface CreateRatingInput {
  apartmentId: string;
  userId: string;
  rating: RatingValue;
}

export const createRating = async (input: CreateRatingInput): Promise<HOARating> => {
  return prisma.hOARating.create({
    data: {
      apartmentId: input.apartmentId,
      userId: input.userId,
      rating: input.rating,
    },
  });
};

export const getRatingSummary = async () => {
  const ratings = await prisma.hOARating.groupBy({
    by: ['rating'],
    _count: {
      rating: true,
    },
  });

  const total = ratings.reduce((sum, item) => sum + item._count.rating, 0);

  const summary = ratings.map(item => ({
    rating: item.rating,
    count: item._count.rating,
    percentage: total > 0 ? (item._count.rating / total) * 100 : 0,
  }));

  return { total, summary };
};
