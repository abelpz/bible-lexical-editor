import { pushToArray, handleSubtypeNS } from "./utils";

/**
 * Structure of nodes in PERF
 * @link https://github.com/Proskomma/proskomma-json-tools/tree/main/src/schema/structure/0_4_0
 */
const PerfStrutureTypes = {
  SEQUENCE: "sequence",
  BLOCK: "block",
  CONTENT_TEXT: "contentText",
  CONTENT_ELEMENT: "contentElement",
};

export const convertPerf = ({ perfDocument, nodeBuilder }) => {
  return {
    ...perfDocument,
    sequences: Object.keys(perfDocument.sequences).reduce(
      (convertedSequences, sequenceId) => {
        convertedSequences[sequenceId] = convertSequence({
          sequence: perfDocument.sequences[sequenceId],
          sequenceId,
          nodeBuilder,
        });
        return convertedSequences;
      },
      {},
    ),
  };
};

export const convertSequence = ({
  sequence,
  sequenceId,
  nodeBuilder: buildNode,
}) => {
  const { blocks, ...props } = sequence;
  const path = `$.sequences.${sequenceId}`;
  return buildNode({
    path,
    kind: PerfStrutureTypes.SEQUENCE,
    props: { ...props, subtype: "sequence", sequenceId },
    children: blocks?.reduce(
      (convertedBlocks, block, index) =>
        ((convertedBlock) =>
          convertedBlock
            ? pushToArray(convertedBlocks, convertedBlock)
            : convertedBlocks)(
          convertBlock({
            block,
            nodeBuilder: buildNode,
            path: path + `.blocks[${index}]`,
          }),
        ),
      [],
    ),
  });
};

export const convertBlock = ({ block, nodeBuilder: buildNode, path }) => {
  const { type, subtype, content, ...props } = block;
  const subtypes = handleSubtypeNS(subtype);
  return buildNode({
    path: path,
    kind: PerfStrutureTypes.BLOCK,
    props: { type, ...subtypes, ...props },
    children: getContents({ content, nodeBuilder: buildNode, path }),
  });
};

export const getContents = ({ content, nodeBuilder: buildNode, path }) =>
  content?.reduce((convertedContentNodes, contentItem, index) => {
    const contentPath = path + `.content[${index}]`;
    return ((convertedContentNode) =>
      convertedContentNode
        ? pushToArray(convertedContentNodes, convertedContentNode)
        : convertedContentNodes)(
      typeof contentItem === "string"
        ? buildNode({
            path: contentPath,
            kind: PerfStrutureTypes.CONTENT_TEXT,
            props: { text: contentItem, type: "text" },
          })
        : convertContentElement({
            element: contentItem,
            nodeBuilder: buildNode,
            path: contentPath,
          }),
    );
  }, []) ?? [];

export const convertContentElement = ({
  element,
  nodeBuilder: buildNode,
  path,
}) => {
  const { type, subtype, content, meta_content, ...props } = element;
  const subtypes = handleSubtypeNS(subtype);

  const converters = {
    wrapper: () => [...getContents({ content, nodeBuilder: buildNode, path })],
    //extend if new content types converters are needed. e.g:
    //mark: ...,
    //graft: ...,
  };

  const convertContents = converters[type];

  return buildNode({
    path,
    kind: PerfStrutureTypes.CONTENT_ELEMENT,
    props: {
      type,
      ...subtypes,
      ...props,
      ...(meta_content ?? {
        metaContent: getContents({
          content: meta_content,
          nodeBuilder: buildNode,
          path,
        }),
      }),
    },
    children: convertContents ? convertContents() : [],
  });
};

export default convertPerf;
