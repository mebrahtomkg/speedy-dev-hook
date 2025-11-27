import ts from 'typescript';
import { ISelection } from './types';
import calcStringSelection from './calcStringSelection';
import calcTemplateStringSelection from './calcTemplateStringSelection';
import calcListSelection from './calcListSelection';
import calcFnCallSelection from './calcFnCallSelection';
import calcFunctionSelection from './calcFunctionSelection';

const calcNodeSelection = (node: ts.Node, sel: ISelection) => {
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
      return calcStringSelection(node, sel);

    case ts.SyntaxKind.FirstTemplateToken:
      return calcTemplateStringSelection(node, sel);

    case ts.SyntaxKind.ArrayLiteralExpression:
    case ts.SyntaxKind.ArrayBindingPattern:
    case ts.SyntaxKind.ObjectLiteralExpression:
    case ts.SyntaxKind.ObjectBindingPattern:
      return calcListSelection(node, sel);

    case ts.SyntaxKind.CallExpression:
      return calcFnCallSelection(node as ts.CallExpression, sel);

    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.FunctionDeclaration:
      return calcFunctionSelection(node as ts.ArrowFunction, sel);
  }

  // Default is selecting the whole node content
  return {
    start: node.getStart(),
    end: node.end,
  };
};

export default calcNodeSelection;
