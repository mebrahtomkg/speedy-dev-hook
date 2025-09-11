import ts from 'typescript';
import { ISelection } from './types';

const calcStringSelection = (
  node: ts.StringLiteral,
  prevSel: ISelection,
): ISelection => {
  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  // If the whole string literal was selected (except the quotes),
  // select the entire node including the quotes.
  if (prevSel.start === nodeStart + 1 && prevSel.end === nodeEnd - 1) {
    return {
      start: nodeStart,
      end: nodeEnd,
    };
  }

  // Otherwise select only the text part (excluding the surrounding quotes)
  return {
    start: nodeStart + 1,
    end: nodeEnd - 1,
  };
};

export default calcStringSelection;
