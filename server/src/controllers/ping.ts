import { Request, Response, NextFunction } from 'express';

let pingCount = 0;

const ping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(
      `${++pingCount})`,
      '***************I am alive!************',
      'Time:',
      Date.now(),
    );

    res.status(200).send('I am alive!');
  } catch (err) {
    next(err);
  }
};

export default ping;
