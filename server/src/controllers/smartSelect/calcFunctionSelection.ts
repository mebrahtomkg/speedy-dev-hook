import ts from 'typescript';
import { ISelection } from './types';

const calcFunctionSelection = (
  node: ts.ArrowFunction | ts.FunctionDeclaration,
  prevSel: ISelection,
): ISelection => {
  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  const fullSelection: ISelection = {
    start: nodeStart,
    end: nodeEnd,
  };

  const parameters = node.parameters;

  // If there are no parameters do full selection. this also prevent error that result
  // from calling methods on undefined parameters
  if (parameters.length === 0) {
    return fullSelection;
  }

  const firstParam = parameters[0];
  const lastParam = parameters[parameters.length - 1];

  const firstParamStart = firstParam.getStart();
  const lastParamEnd = lastParam.end;

  const leftParenthesesPos = firstParamStart - 1;
  const rightParenthesesPos = lastParamEnd + 1;

  const allParamsSelection: ISelection = {
    start: firstParamStart,
    end: lastParamEnd,
  };

  const enclosingSelection: ISelection = {
    start: leftParenthesesPos,
    end: rightParenthesesPos,
  };

  // If the selection was outside the params enclosing range, select the whole node.
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

  // If all params without the left and right parentheses were selected
  // select the entire args enclosing.
  if (prevSel.start === firstParamStart && prevSel.end === lastParamEnd) {
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

  // If the char after the selection is comma, select the param with the comma
  // this is usefull for selecting param for removal. as the comma next to it
  // must also removed.
  if (fileText[prevSel.end] === ',') {
    return {
      start: prevSel.start,
      end: prevSel.end + 1,
    };
  }

  // Otherwise select the params enclosing.
  return allParamsSelection;
};

export default calcFunctionSelection;
