import { WORD_SEPARATORS } from './constants';
import { ISelection } from './types';

const calcWordSelection = (
  text: string,
  cursorPosition: number,
): ISelection | null => {
  let start = cursorPosition;
  let end = cursorPosition;

  while (start > 0) {
    if (WORD_SEPARATORS.has(text[start - 1])) break;
    start--;
  }

  while (end < text.length) {
    if (WORD_SEPARATORS.has(text[end])) break;
    end++;
  }

  if (end - start <= 0) {
    return null;
  }

  return { start, end };
};

export default calcWordSelection;
