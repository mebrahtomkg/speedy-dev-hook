import { MAX_INACTIVE_TIME } from '@/config';
import { shutdown } from '@/utils';
import { Request, Response, NextFunction } from 'express';

let timeout: NodeJS.Timeout | null = null;

// Function to schedule server shutdown
export const scheduleServerShutdown = () => {
  timeout = setTimeout(() => {
    shutdown(
      `Server was inactive for ${MAX_INACTIVE_TIME / 1000}seconds. shutting it down... `,
    );
  }, MAX_INACTIVE_TIME);
};

const serverLifeManager = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extend server life time
    if (timeout) clearTimeout(timeout);
    scheduleServerShutdown();

    next();
  } catch (err) {
    next(err);
  }
};

export default serverLifeManager;
