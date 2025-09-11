import ts from 'typescript';
import { ISelection } from './types';

const findTargetNode = (
  sourceFile: ts.SourceFile,
  position: number,
  sel: ISelection,
) => {
  const isValidSelection = sel.start >= 0 && sel.end >= 0;

  let targetNode: ts.Node | undefined;

  const visitor = (node: ts.Node) => {
    const nodeStart = node.getStart(sourceFile);
    const nodeEnd = node.end;

    if (isValidSelection && nodeStart === sel.start && nodeEnd === sel.end) {
      targetNode = node;
      return;
    }

    if (position >= nodeStart && position < node.end) {
      targetNode = node;
      ts.forEachChild(node, visitor);
    }
  };

  visitor(sourceFile);

  return targetNode;
};

export default findTargetNode;
