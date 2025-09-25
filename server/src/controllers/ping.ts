import { Request, Response, NextFunction } from 'express';

const ping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).send('I am alive!');
  } catch (err) {
    next(err);
  }
};

export default ping;
