import { Request, Response, NextFunction } from 'express';
import { performUniversalSearch } from '../services/searchService';

export const searchController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length === 0) {
      res.status(200).json({
        success: true,
        data: { users: [], apartments: [], vehicles: [], tickets: [] }
      });
      return;
    }

    const results = await performUniversalSearch(query.trim());

    res.status(200).json({
      success: true,
      message: 'Search completed',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
