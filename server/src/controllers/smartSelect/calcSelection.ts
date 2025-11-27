import ts from 'typescript';
import { ISelection } from './types';
import findTargetNode from './findTargetNode';
import calcTokenSelection from './calcTokenSelection';
import path from 'node:path';
import calcNodeSelection from './calcNodeSelection';
import calcWordSelection from './calcWordSelection';
import calcCommentSelection from './calcCommentSelection';

const calcSelection = (
  filepath: string,
  sourceText: string,
  cursorPosition: number,
  prevSel: ISelection,
): ISelection => {
  // Default selection is selecting the whole document
  const defaultSel = {
    start: 0,
    end: sourceText.length,
  };

  // If there was no selection before, use token selection without needing typescript AST.
  if (prevSel.start < 0 || prevSel.end < 0) {
    const tokenSel = calcTokenSelection(sourceText, cursorPosition);
    const wordSel = calcWordSelection(sourceText, cursorPosition);

    // If all content of the word selection is exactly to the left of the cursor, prefer
    // the word section instead of the token selection.
    if (wordSel && wordSel.end === cursorPosition) {
      return wordSel;
    }

    return tokenSel || wordSel || defaultSel;
  }

  // If the cursor is inside single line comment and the prev selection is not exactly
  // with the currently calculated comment selection return the comment selection
  const commentSel = calcCommentSelection(sourceText, cursorPosition);
  if (
    commentSel &&
    !(prevSel.start === commentSel.start && prevSel.end === commentSel.end)
  ) {
    return commentSel;
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

  if (!node) return defaultSel;

  console.log('');
  console.log('Target node', ts.SyntaxKind[node.kind]);
  console.log('Parent node', ts.SyntaxKind[node.parent.kind]);

  const nodeStart = node.getStart();
  const nodeEnd = node.end;

  const isNodeFullySelected =
    prevSel.start <= nodeStart && prevSel.end >= nodeEnd;

  // If the node was fully selected, do selection on its parent, otherwise do selection
  // on the node it self.
  if (isNodeFullySelected && node.parent) {
    return calcNodeSelection(node.parent, prevSel);
  }

  return calcNodeSelection(node, prevSel);
};

export default calcSelection;
