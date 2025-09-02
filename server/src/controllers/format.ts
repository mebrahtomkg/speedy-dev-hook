import { Request, Response, NextFunction } from 'express';

const format = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      message: '',
    });
  } catch (err) {
    next(err);
  }
};

export default format;
