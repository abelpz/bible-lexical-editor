import { pushToArray } from "./utils";

export const convertLexicalStateNode = ({ node: nodeData, nodeBuilder: buildNode }) => {
  const { children, ...node } = nodeData;
  return buildNode
    ? buildNode({
        node,
        children: children?.reduce(
          (convertedNodes, node) =>
            ((convertedNode) =>
              convertedNode ? pushToArray(convertedNodes, convertedNode) : convertedNodes)(
              convertLexicalStateNode({ node, nodeBuilder: buildNode }),
            ),
          [],
        ),
      })
    : undefined;
};
