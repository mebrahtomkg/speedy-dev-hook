import ts from 'typescript';

const getNodes = (sourceFile: ts.SourceFile): ts.Node[] => {
  const nodes: ts.Node[] = [];

  const visitor = (node: ts.Node) => {
    nodes.push(node);
    ts.forEachChild(node, visitor);
  };

  visitor(sourceFile);

  return nodes;
};

export default getNodes;
