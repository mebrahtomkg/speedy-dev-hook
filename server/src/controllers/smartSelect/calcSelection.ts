import ts from 'typescript';
import { ISelection } from './types';
import findTargetNode from './findTargetNode';
import calcTokenSelection from './calcTokenSelection';
import calcStringSelection from './calcStringSelection';

const calcSelection = (
  sourceText: string,
  cursorPosition: number,
  prevSel: ISelection,
): ISelection => {
  // If there was no selection before use token selection, without needing typescript AST.
  if (prevSel.start < 0 || prevSel.end < 0) {
    return calcTokenSelection(sourceText, cursorPosition);
  }

  const sourceFile = ts.createSourceFile(
    'test.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  // Default selection is selecting the whole document
  let start = sourceFile.pos;
  let end = sourceFile.end;

  let node = findTargetNode(sourceFile, cursorPosition, prevSel);

  if (!node) return { start, end };

  start = node.getStart();
  end = node.end;

  console.log('Target node', {
    kind: ts.SyntaxKind[node.kind],
  });

  // If the node was fully selected and if it has a parent, select its parent node.
  if (prevSel.start === start && prevSel.end === end && node.parent) {
    node = node.parent;
    start = node.getStart();
    end = node.end;
  }

  console.log('Selected node', {
    kind: ts.SyntaxKind[node.kind],
  });

  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
      if (ts.isStringLiteral(node)) {
        ({ start, end } = calcStringSelection(node, cursorPosition, prevSel));
      }
      break;
  }

  return { start, end };
};

export default calcSelection;
