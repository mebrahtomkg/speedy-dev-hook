import { ISelection } from './types';

const calcCommentSelection = (
  text: string,
  cursorPosition: number,
): ISelection | null => {
  let start = cursorPosition;
  let end = cursorPosition;
  let commentStartPos = -1;

  // The '//' could be at first of the selection
  if (text[start] === '/' && text[start + 1] === '/') {
    commentStartPos = start;
  }

  // Scan to left to identify the correct location of the '//' token.
  // Every time we found a '//' token, we save its position to a variable. once the loop breaks
  // the correct '//' token position will be in the variable.
  // Break the loop while encountering new line token. as we are finding a single line comment.
  while (--start > 0) {
    if (text[start] === '/' && text[start + 1] === '/') {
      commentStartPos = start; // Save the '//' token position
    }
    if (text[start] === '\n') break;
  }

  while (end < text.length) {
    if (text[end] === '\n') break;
    end++;
  }

  if (commentStartPos === -1) {
    return null;
  }

  start = commentStartPos;

  if (end - start <= 0) {
    return null;
  }

  return { start, end };
};

export default calcCommentSelection;
