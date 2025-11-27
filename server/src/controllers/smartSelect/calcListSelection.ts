import ts from 'typescript';
import { ISelection } from './types';

const calcListSelection = (node: ts.Node, prevSel: ISelection): ISelection => {
  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  const fullSelection = {
    start: nodeStart,
    end: nodeEnd,
  };

  // If the whole array/object was selected (except the brackets or braces)
  // select the entire node.
  if (prevSel.start === nodeStart + 1 && prevSel.end === nodeEnd - 1) {
    return fullSelection;
  }

  // If the left bracket/brace was selected: select the whole node.
  if (prevSel.start === nodeStart && prevSel.end === nodeStart + 1) {
    return fullSelection;
  }

  // If the right bracket/brace was selected: select the whole node.
  if (prevSel.start === nodeEnd - 1 && prevSel.end === nodeEnd) {
    return fullSelection;
  }

  const fileText = node.getSourceFile().text;

  // If the char after the selection is comma, select the element/property with the comma
  // this is usefull for selecting an element/property for removal. as the comma next to it
  // must also removed.
  if (fileText[prevSel.end] === ',') {
    return {
      start: prevSel.start,
      end: prevSel.end + 1,
    };
  }

  // Otherwise select the whole content of the node except the enclosing brackets/braces.
  return {
    start: nodeStart + 1,
    end: nodeEnd - 1,
  };
};

export default calcListSelection;
