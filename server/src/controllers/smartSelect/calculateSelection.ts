import ts from 'typescript';
import { ISelection } from './types';
import findDeepestNode from './findDeepestNode';

const calculateSelection = (
  sourceText: string,
  cursorPosition: number,
): ISelection => {
  const sourceFile = ts.createSourceFile(
    'test.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const node = findDeepestNode(sourceFile, cursorPosition);

  if (!node) {
    return {
      start: sourceFile.pos,
      end: sourceFile.end,
    };
  }

  return {
    start: node.getStart(sourceFile),
    end: node.end,
  };
};

export default calculateSelection;
