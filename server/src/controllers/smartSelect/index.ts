import { Request, Response, NextFunction } from 'express';
import calculateSelection from './calculateSelection';

const smartSelect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sourceText = req.body?.sourceText;
    const cursorPosition = req.body.cursorPosition;

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

    const selection = calculateSelection(sourceText, cursorPosition);

    res.status(200).json({
      sourceText,
      selection,
    });
  } catch (err) {
    next(err);
  }
};

export default smartSelect;
