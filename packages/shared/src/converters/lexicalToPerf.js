import { convertLexicalStateNode } from "./lexicalToX";

export const transformLexicalStateToPerf = (lexicalStateNode) => {
  const perf = { sequences: {} };
  perf.targetSequence = convertLexicalStateNode({
    node: lexicalStateNode,
    nodeBuilder: (props) => customNodeBuilder({ ...props, perf }),
  });
  return perf;
};
export default transformLexicalStateToPerf;

const customNodeBuilder = ({
  node: {
    data: { kind, path, ...data },
    ...node
  },
  children,
  perf,
}) =>
  ((lexicalMap) =>
    mapLexical({
      node,
      children,
      data,
      kind,
      path,
      lexicalMap,
    }))(createLexicalMap(perf));

const mapLexical = ({
  node,
  children,
  data,
  kind,
  path,
  defaults,
  lexicalMap,
}) => {
  const _defaults = defaults ?? { node, children, data, kind, path };

  if (!lexicalMap) return _defaults;

  const maps = [lexicalMap[kind], lexicalMap.default];

  return (
    ((map) => (typeof map === "function" ? map(_defaults) : map))(
      maps.find((map) => map !== undefined),
    ) ?? _defaults
  );
};

const createLexicalMap = (perf) => ({
  default: ({ node, children, kind }) => {
    if (node?.type === "root") return { type: "main", blocks: children };
    if (node?.type === "text") return node.text;
    throw new Error(`unhandled kind: ${kind}`);
  },
  block: ({ node, children, data }) => {
    const { type } = data || {};
    if (type === "graft") return buildGraft({ perf, node, data, children });
    return {
      ...data,
      content: children,
    };
  },
  contentElement: ({ node, children, data }) => {
    const { type, subtype } = data || {};
    if (type === "graft") return buildGraft({ perf, node, data, children });
    if (["verses", "chapter"].includes(subtype)) return { ...data };
    return {
      ...data,
      ...(children?.length ? { content: children } : undefined),
    };
  },
});

const buildGraft = ({ perf, node, data, children }) => {
  perf.sequences[node.data.target] = {
    type: node.data.subtype,
    blocks: children,
  };
  return { ...data };
};
