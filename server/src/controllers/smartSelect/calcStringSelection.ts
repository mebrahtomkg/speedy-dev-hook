import ts from 'typescript';
import { ISelection } from './types';
import { WORD_SEPARATORS } from './constants';

const calcStringSelection = (
  node: ts.StringLiteral,
  cursorPosition: number,
  prevSel: ISelection,
): ISelection => {
  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  // If the whole string literal was selected (except the quotes),
  // then select the whole node including quotes.
  if (prevSel.start === nodeStart + 1 && prevSel.end === nodeEnd - 1) {
    return {
      start: nodeStart,
      end: nodeEnd,
    };
  }

  // If anthing (eg. a word) was selected inside the string literal.
  // then select the whole text (excluding the surrounding quotes)
  if (
    prevSel.start >= 0 &&
    prevSel.end >= 0 &&
    prevSel.end - prevSel.start >= 1
  ) {
    return {
      start: nodeStart + 1,
      end: nodeEnd - 1,
    };
  }

  // No previous selection!, so calculate word selection...

  // Get all source code of the file
  const text = node.getSourceFile().text;

  console.log("'import/bom'", './models/user', 't, ids example txt');

  // Start and end positions of the text(text inside the quotes) of the StringLiteral.
  const stringStart = nodeStart + 1;
  const stringEnd = nodeEnd - 1;

  let start = cursorPosition;
  while (!WORD_SEPARATORS.has(text[start - 1]) && start > stringStart) {
    start--;
  }

  let end = cursorPosition;
  while (!WORD_SEPARATORS.has(text[end]) && end < stringEnd) {
    end++;
  }

  return { start, end };
};

export default calcStringSelection;
