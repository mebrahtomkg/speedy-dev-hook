import ts from 'typescript';
import { ISelection } from './types';

const findTargetNode = (
  sourceFile: ts.SourceFile,
  position: number,
  sel: ISelection,
) => {
  const startTime = Date.now();

  const selStart = sel.start;
  const selEnd = sel.end;

  const isValidSelection = selStart >= 0 && selEnd >= 0;

  let selectionHolder: ts.Node | undefined;
  let positionHolder: ts.Node | undefined;

  const selectionHolderFinder = (node: ts.Node) => {
    const nodeStart = node.getStart();
    const nodeEnd = node.end;

    if (selStart === nodeStart && selEnd === nodeEnd) {
      selectionHolder = node;
      return;
    }

    if (selStart >= nodeStart && selEnd <= nodeEnd) {
      selectionHolder = node;
      ts.forEachChild(node, selectionHolderFinder);
    }
  };
  if (isValidSelection) selectionHolderFinder(sourceFile);

  const positionHolderFinder = (node: ts.Node) => {
    const nodeStart = node.getStart();
    const nodeEnd = node.end;

    if (position >= nodeStart && position < nodeEnd) {
      positionHolder = node;
      ts.forEachChild(node, positionHolderFinder);
    }
  };
  if (!selectionHolder) positionHolderFinder(sourceFile);

  console.log('Target node found in', Date.now() - startTime, 'ms');

  // Prioritize the node that is holding the selection
  return selectionHolder || positionHolder;
};

export default findTargetNode;
