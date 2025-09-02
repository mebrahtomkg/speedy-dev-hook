import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction, // It is required here, though not used.
) => {
  console.error(`ERROR: ${err.toString()}  ${err.stack}`);

  res.status(500).json({
    message: `INTERNAL SERVER ERROR: ${err.toString()}  ${err.stack}`,
  });
};

export default errorHandler;
