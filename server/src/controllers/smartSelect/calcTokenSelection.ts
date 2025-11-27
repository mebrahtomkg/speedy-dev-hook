import { TOKENS } from './constants';
import { ISelection } from './types';

const calcTokenSelection = (
  text: string,
  cursorPosition: number,
): ISelection | null => {
  let start = cursorPosition;
  let end = cursorPosition;
  let token = '';

  while (start > 0) {
    const newToken = `${text[start - 1]}${token}`;
    if (!TOKENS.has(newToken)) break;
    token = newToken;
    start--;
  }

  while (end < text.length) {
    const newToken = `${token}${text[end]}`;
    if (!TOKENS.has(newToken)) break;
    token = newToken;
    end++;
  }

  if (end - start <= 0) {
    return null;
  }

  return { start, end };
};

export default calcTokenSelection;
