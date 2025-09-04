import { PRETTIER_SUPPORTED_EXTS } from '@/config';
import { Request, Response, NextFunction } from 'express';
import prettier from 'prettier';

const format = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filepath =
      typeof req.body?.filepath === 'string' ? req.body.filepath.trim() : null;

    if (!filepath) {
      res.status(400).send('Invalid file path');
      return;
    }

    // Normalize path first (replace `\` with `/`)
    if (filepath.replace(/\\/g, '/').split('/').includes('..')) {
      res.status(400).send('File Path cannot contain `../`');
      return;
    }

    const ext = filepath
      .toLowerCase()
      .slice(
        Math.max(0, filepath.lastIndexOf('.')) || Number.POSITIVE_INFINITY,
      );

    if (!ext) {
      res.status(400).send('Could not find extension from the filepath');
      return;
    }

    if (!PRETTIER_SUPPORTED_EXTS.includes(ext)) {
      res.status(400).send(`Unsupported file type: '${ext}'`);
      return;
    }

    const content =
      typeof req.body.content === 'string' ? req.body.content.trim() : null;

    if (typeof content !== 'string') {
      res.status(400).send('Invalid content');
      return;
    }

    const options = await prettier.resolveConfig(filepath);

    const formattedText = await prettier.format(content, {
      ...options,
      filepath,
    });

    res.status(200).send(formattedText);
  } catch (err) {
    next(err);
  }
};

export default format;
