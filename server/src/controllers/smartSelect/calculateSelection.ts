import ts from 'typescript';
import { ISelection } from './types';
import getNodes from './getNodes';

const calculateSelection = (
  sourceText: string,
  cursorPosition: number,
  selectionStart: number,
  selectionEnd: number,
): ISelection => {
  const sourceFile = ts.createSourceFile(
    'test.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const nodes = getNodes(sourceFile);

  let targetNode: ts.Node | null = null;

  // Incase selected node exists
  if (selectionStart >= 0 && selectionEnd >= 0) {
    for (const node of nodes) {
      const nodeStart = node.getStart(sourceFile);
      const nodeEnd = node.end;
      if (nodeStart === selectionStart && nodeEnd === selectionEnd) {
        targetNode = node.parent;
      }
    }
  }

  if (!targetNode) {
    for (const node of nodes) {
      const nodeStart = node.getStart(sourceFile);
      const nodeEnd = node.end;
      if (cursorPosition >= nodeStart && cursorPosition < nodeEnd) {
        targetNode = node;
      }
    }
  }

  const node = targetNode;

  let start = sourceFile.pos;
  let end = sourceFile.end;

  if (!node) return { start, end };

  console.log('node', {
    kind: ts.SyntaxKind[node.kind],
  });

  start = node.getStart(sourceFile);
  end = node.end;

  const wasSelection = selectionStart > -1 && selectionEnd > -1;

  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
      if (ts.isStringLiteral(node)) {
        console.log("'getText/bom'", node.getText());
        if (!wasSelection) {
          // exceculude the 's and "s
          start++;
          end--;
        }
      }
      break;

    case ts.SyntaxKind.PrefixUnaryExpression:
      if (!wasSelection) {
        // only select the symbol eg. '!'
        end = start + 1;
      }
      break;
  }

  return { start, end };
};

export default calculateSelection;
