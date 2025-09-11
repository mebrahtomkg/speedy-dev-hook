import { ISelection } from './types';
import { TOKENS, WORD_SEPARATORS } from './constants';

const calcTokenSelection = (
  text: string,
  cursorPosition: number,
): ISelection => {
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

  console.log("'import/test'", './models/user', 't, ids example txt');

  if (end - start > 0) return { start, end };

  while (start > 0) {
    if (WORD_SEPARATORS.has(text[start - 1])) break;
    start--;
  }

  while (end < text.length) {
    if (WORD_SEPARATORS.has(text[end])) break;
    end++;
  }

  return { start, end };
};

export default calcTokenSelection;
