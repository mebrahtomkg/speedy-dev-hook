import ts from 'typescript';
import { ISelection } from './types';

const calcStringSelection = (
  node: ts.Node,
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

  // If the left quote was selected: select the whole node string.
  if (prevSel.start === nodeStart && prevSel.end === nodeStart + 1) {
    return {
      start: nodeStart,
      end: nodeEnd,
    };
  }

  // If the right quote was selected: select the whole node string.
  if (prevSel.start === nodeEnd - 1 && prevSel.end === nodeEnd) {
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
