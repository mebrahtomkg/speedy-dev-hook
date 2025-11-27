import ts from 'typescript';
import { ISelection } from './types';

const calcFnCallSelection = (
  node: ts.CallExpression,
  prevSel: ISelection,
): ISelection => {
  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  const fullSelection: ISelection = {
    start: nodeStart,
    end: nodeEnd,
  };

  // If there are no args do full selection. this also prevent error that result
  // from calling methods on undefined args
  if (node.arguments.length === 0) {
    return fullSelection;
  }

  const firstArg = node.arguments[0];
  const lastArg = node.arguments[node.arguments.length - 1];

  const firstArgStart = firstArg.getStart();
  const lastArgEnd = lastArg.end;

  const leftParenthesesPos = firstArgStart - 1;
  const rightParenthesesPos = lastArgEnd + 1;

  const allArgsSelection: ISelection = {
    start: firstArgStart,
    end: lastArgEnd,
  };

  const enclosingSelection: ISelection = {
    start: leftParenthesesPos,
    end: rightParenthesesPos,
  };

  // If the selection was outside the args enclosing range, select the whole node.
  if (prevSel.start < leftParenthesesPos || prevSel.end > rightParenthesesPos) {
    return fullSelection;
  }

  // If the whole enclosing was selected, select the whole node
  if (
    prevSel.start === leftParenthesesPos &&
    prevSel.end === rightParenthesesPos
  ) {
    return fullSelection;
  }

  // If all args without the left and right parentheses were selected
  // select the entire args enclosing.
  if (prevSel.start === firstArgStart && prevSel.end === lastArgEnd) {
    return enclosingSelection;
  }

  // If the left parentheses was selected: select the enclosing.
  if (
    prevSel.start === leftParenthesesPos &&
    prevSel.end === leftParenthesesPos + 1
  ) {
    return enclosingSelection;
  }

  // If the right parentheses was selected: select the enclosing.
  if (
    prevSel.start === rightParenthesesPos - 1 &&
    prevSel.end === rightParenthesesPos
  ) {
    return enclosingSelection;
  }

  const fileText = node.getSourceFile().text;

  // If the char after the selection is comma, select the arg with the comma
  // this is usefull for selecting arg for removal. as the comma next to it
  // must also removed.
  if (fileText[prevSel.end] === ',') {
    return {
      start: prevSel.start,
      end: prevSel.end + 1,
    };
  }

  // Otherwise select the args enclosing.
  return allArgsSelection;
};

export default calcFnCallSelection;
