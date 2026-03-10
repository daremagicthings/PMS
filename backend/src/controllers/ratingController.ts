import { Request, Response, NextFunction } from 'express';
import { createRating, getRatingSummary } from '../services/ratingService';

export const submitRatingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { apartmentId, userId, rating } = req.body;

    if (!apartmentId || !userId || !rating) {
      res.status(400).json({
        success: false,
        message: 'apartmentId, userId, and rating are required',
      });
      return;
    }

    const newRating = await createRating({ apartmentId, userId, rating });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating,
    });
  } catch (error) {
    next(error);
  }
};

export const getRatingSummaryController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await getRatingSummary();
    res.status(200).json({
      success: true,
      message: 'Rating summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
