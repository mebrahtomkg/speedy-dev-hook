import { Request, Response, NextFunction } from 'express';
import ts from 'typescript';

interface SelectedNode {
  kind: string;
  text: string;
  start: number;
  end: number;
  parentKind?: string;
}

// Helper function to find the deepest node at a given position
function findDeepestNodeAtPosition(
  sourceFile: ts.SourceFile,
  position: number,
): ts.Node | undefined {
  let deepestNode: ts.Node | undefined;

  // Define a recursive visitor function
  function visitor(node: ts.Node) {
    // Use node.getStart(sourceFile) for a more accurate start of the actual code
    // It accounts for leading whitespace/comments, which node.pos might include.
    const nodeStart = node.getStart(sourceFile);

    // Check if the current node's span contains the position
    // node.end is exclusive, so position must be strictly less than node.end
    if (position >= nodeStart && position < node.end) {
      // This node contains the position. It's a candidate for the deepest.
      // Since we are traversing depth-first, the last node that satisfies this
      // condition will be the deepest one found.
      deepestNode = node;

      // Now, try to go deeper by visiting children.
      ts.forEachChild(node, visitor); // Recursively call visitor for each child
    }
  }

  // Start the traversal from the root of the AST (the sourceFile)
  visitor(sourceFile);

  // Return the deepest node found. If the cursor was in whitespace outside any specific
  // code element, deepestNode might remain undefined or be the SourceFile itself.
  return deepestNode;
}

const smartSelect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sourceText = req.body?.sourceText;
    const cursorPosition = req.body.cursorPosition;

    if (typeof sourceText !== 'string') {
      return res.status(400).send('Invalid source text!');
    }

    if (
      typeof cursorPosition !== 'number' ||
      cursorPosition < 0 ||
      cursorPosition > sourceText.length
    ) {
      return res.status(400).send('Invalid cursor position!');
    }

    const sourceFile = ts.createSourceFile(
      'example.ts',
      sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    let selectedNode: SelectedNode | null = null;

    const node = findDeepestNodeAtPosition(sourceFile, cursorPosition);

    if (node) {
      selectedNode = {
        kind: ts.SyntaxKind[node.kind],
        text: node.getText(sourceFile),
        start: node.pos,
        end: node.end,
      };

      if (node.parent) {
        selectedNode.parentKind = ts.SyntaxKind[node.parent.kind];
      }
    }

    res.status(200).json({
      sourceText,
      selectedNode,
    });
  } catch (err) {
    next(err);
  }
};

export default smartSelect;
