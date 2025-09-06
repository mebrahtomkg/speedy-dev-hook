import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { runCommandInTerminal } from '@/utils';

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

    const script =
      typeof req.query.script === 'string' ? req.query.script.trim() : null;

    if (!script) {
      res.status(400).send('Invalid script name!');
      return;
    }

    let workingDir = folderpath;
    let npmScript = script;

    // Check if the script contains a path (e.g., "server/start", "packages/cli/start")
    const scriptParts = script.split('/');

    if (scriptParts.length > 1) {
      // The last part is the actual npm script name (e.g., 'start')
      npmScript = scriptParts[scriptParts.length - 1];

      // The preceding parts form the subfolder path (e.g., 'server', 'packages/cli')
      const subfolderPath = scriptParts.slice(0, -1).join('/');

      workingDir = path.join(folderpath, subfolderPath);
    }

    // Verify if the calculated working directory exists
    try {
      await fs.access(workingDir, fs.constants.F_OK);
    } catch (_dirErr) {
      res
        .status(400)
        .send(`Project or subfolder path does not exist: '${workingDir}'`);
      return;
    }

    const commandToRun = `npm run ${npmScript}`;

    runCommandInTerminal(commandToRun, workingDir, script);

    res.status(200).send(`Successfully started running npm script.`);
  } catch (err) {
    next(err);
  }
};

export default runScript;
