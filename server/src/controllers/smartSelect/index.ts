import { Request, Response, NextFunction } from 'express';
import calcSelection from './calcSelection';

const smartSelect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      filepath,
      sourceText,
      cursorPosition,
      selectionStart,
      selectionEnd,
    } = req.body;

    if (typeof filepath !== 'string') {
      return res.status(400).send('Invalid filepath!');
    }

    if (typeof sourceText !== 'string') {
      return res.status(400).send('Invalid source text!');
    }

    if (
      typeof cursorPosition !== 'number' ||
      cursorPosition < 0 ||
      cursorPosition > sourceText.length
    ) {
      return res.status(400).send('Invalid cursor position!');
    }

    if (
      typeof selectionStart !== 'number' ||
      selectionStart < -1 ||
      selectionStart > sourceText.length
    ) {
      return res.status(400).send('Invalid selection start!');
    }

    if (
      typeof selectionEnd !== 'number' ||
      selectionEnd < -1 ||
      selectionEnd > sourceText.length
    ) {
      return res.status(400).send('Invalid selection end!');
    }

    const selection = calcSelection(filepath, sourceText, cursorPosition, {
      start: selectionStart,
      end: selectionEnd,
    });

    res.status(200).json({
      sourceText,
      selection,
    });
  } catch (err) {
    next(err);
  }
};

export default smartSelect;
