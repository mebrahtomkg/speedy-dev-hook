import ts from 'typescript';
import { ISelection } from './types';
import findTargetNode from './findTargetNode';
import calcTokenSelection from './calcTokenSelection';
import path from 'node:path';
import calcNodeSelection from './calcNodeSelection';

const calcSelection = (
  filepath: string,
  sourceText: string,
  cursorPosition: number,
  prevSel: ISelection,
): ISelection => {
  // If there was no selection before use token selection, without needing typescript AST.
  if (prevSel.start < 0 || prevSel.end < 0) {
    const normalSel = calcTokenSelection(sourceText, cursorPosition);

    const leftPosition = cursorPosition - 1;

    if (leftPosition >= 0 && sourceText[leftPosition] !== ' ') {
      // Token selection that would be calculated if the cursor postion was one minus
      const leftSel = calcTokenSelection(sourceText, leftPosition);

      // If normally calculated selection is not a word selection, and if the left selection
      // is a word selection: prefer the word section that is to the left of the cursor.
      if (!normalSel.isWordSelection && leftSel.isWordSelection) {
        return {
          start: leftSel.start,
          end: leftSel.end,
        };
      }
    }

    return {
      start: normalSel.start,
      end: normalSel.end,
    };
  }

  const fileName = path.basename(filepath);

  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const nodeFinderSel = { ...prevSel };

  // If last char on the prev selection was comma (','), exclude the comma selection. as this
  // comma was probably selected by the list selection function. by exculiding this comma
  // when we use the selection to find target node, we make target node finder's job easy and
  // predictable as it works based on Typescript AST.
  if (sourceText[prevSel.end - 1] === ',' && prevSel.end - prevSel.start > 1) {
    nodeFinderSel.end = prevSel.end - 1;
  }

  const node = findTargetNode(sourceFile, cursorPosition, nodeFinderSel);

  // Default selection is selecting the whole document
  if (!node) {
    return {
      start: sourceFile.pos,
      end: sourceFile.end,
    };
  }

  console.log('');
  console.log('Target node', ts.SyntaxKind[node.kind]);
  console.log('Parent node', ts.SyntaxKind[node.parent.kind]);

  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  const isNodeFullySelected =
    prevSel.start <= nodeStart && prevSel.end >= nodeEnd;

  // If the node was fully selected, do selection on its parent, otherwise do selection
  // on the node it self.
  if (isNodeFullySelected) {
    return calcNodeSelection(node.parent, prevSel);
  }

  return calcNodeSelection(node, prevSel);
};

export default calcSelection;
