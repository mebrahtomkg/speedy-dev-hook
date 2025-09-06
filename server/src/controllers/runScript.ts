import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

const runScript = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderpath =
      typeof req.query?.folderpath === 'string'
        ? req.query.folderpath.trim()
        : null;

    if (!folderpath) {
      res.status(400).send('Invalid folder path!');
      return;
    }

    res.status(500).json('not implemented');
  } catch (err) {
    next(err);
  }
};

export default runScript;
