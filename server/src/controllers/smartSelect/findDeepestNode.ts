import ts from 'typescript';

const findDeepestNode = (sourceFile: ts.SourceFile, position: number) => {
  let deepestNode: ts.Node | undefined;

  const visitor = (node: ts.Node) => {
    const nodeStart = node.getStart(sourceFile);
    if (position >= nodeStart && position < node.end) {
      deepestNode = node;
      ts.forEachChild(node, visitor);
    }
  };

  visitor(sourceFile);

  return deepestNode;
};

export default findDeepestNode;
