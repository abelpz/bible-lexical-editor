import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  CLEAR_HISTORY_COMMAND,
  SerializedEditorState,
  SerializedElementNode,
  SerializedLexicalNode,
  SerializedTextNode,
  TextNode,
} from "lexical";
import { useEffect } from "react";
import {
  MarkerContent,
  MarkerObject,
  USJ_TYPE,
  USJ_VERSION,
  Usj,
} from "shared/converters/usj/usj.model";
import { deserializeUsjType } from "shared/converters/usj/usj.util";
import {
  BOOK_STYLE,
  BOOK_VERSION,
  BookNode,
  SerializedBookNode,
} from "shared/nodes/scripture/usj/BookNode";
import {
  CHAPTER_STYLE,
  CHAPTER_VERSION,
  ImmutableChapterNode,
  SerializedChapterNode,
} from "shared/nodes/scripture/usj/ImmutableChapterNode";
import { CHAR_VERSION, CharNode, SerializedCharNode } from "shared/nodes/scripture/usj/CharNode";
import {
  IMPLIED_PARA_VERSION,
  ImpliedParaNode,
  SerializedImpliedParaNode,
} from "shared/nodes/scripture/usj/ImpliedParaNode";
import {
  PARA_STYLE_DEFAULT,
  PARA_VERSION,
  ParaNode,
  SerializedParaNode,
} from "shared/nodes/scripture/usj/ParaNode";
import { NOTE_VERSION, NoteNode, NoteUsxStyle, SerializedNoteNode } from "../nodes/NoteNode";
import {
  SerializedVerseNode,
  VERSE_STYLE,
  VERSE_VERSION,
  VerseNode,
} from "shared/nodes/scripture/usj/VerseNode";
import { LoggerBasic } from "./logger-basic.model";

// empty para node for an 'empty' editor
const emptyParaNode: SerializedParaNode = createPara(PARA_STYLE_DEFAULT, undefined);

function getTextContent(markers: MarkerContent[] | undefined): string {
  if (!markers || markers.length !== 1 || typeof markers[0] !== "string") return "";

  return markers[0];
}

function createBook<TLogger extends LoggerBasic>(
  style: string,
  marker: MarkerObject,
  logger: TLogger | undefined,
): SerializedBookNode | undefined {
  if (!marker.code) {
    logger?.error(`Unexpected book code '${marker.code}'!`);
    return undefined;
  }
  if (style !== BOOK_STYLE) {
    logger?.error(`Unexpected book style '${style}'!`);
    return undefined;
  }

  return {
    type: BookNode.getType(),
    usxStyle: BOOK_STYLE,
    code: marker.code,
    text: getTextContent(marker.content),
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: BOOK_VERSION,
  };
}

function createChapter<TLogger extends LoggerBasic>(
  style: string,
  marker: MarkerObject,
  logger: TLogger | undefined,
): SerializedChapterNode | undefined {
  if (style !== CHAPTER_STYLE) {
    logger?.error(`Unexpected chapter style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: ImmutableChapterNode.getType(),
    usxStyle: CHAPTER_STYLE,
    number: marker.number ?? "",
    version: CHAPTER_VERSION,
  };
}

function createVerse<TLogger extends LoggerBasic>(
  style: string,
  marker: MarkerObject,
  logger: TLogger | undefined,
): SerializedVerseNode | undefined {
  if (style !== VERSE_STYLE) {
    logger?.error(`Unexpected verse style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: VerseNode.getType(),
    usxStyle: VERSE_STYLE,
    number: marker.number ?? "",
    text: marker.number ?? "",
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: VERSE_VERSION,
  };
}

function createChar<TLogger extends LoggerBasic>(
  style: string,
  marker: MarkerObject,
  logger: TLogger | undefined,
): SerializedCharNode | undefined {
  if (!CharNode.isValidStyle(style)) {
    logger?.error(`Unexpected char style '${style}'!`);
    return undefined;
  }

  return {
    type: CharNode.getType(),
    usxStyle: style,
    text: getTextContent(marker.content),
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: CHAR_VERSION,
  };
}

function createImpliedPara(
  children: (SerializedTextNode | SerializedElementNode)[],
): SerializedImpliedParaNode {
  return {
    type: ImpliedParaNode.getType(),
    children,
    direction: null,
    format: "",
    indent: 0,
    version: IMPLIED_PARA_VERSION,
  };
}

function createPara<TLogger extends LoggerBasic>(
  style: string,
  logger: TLogger | undefined,
): SerializedParaNode {
  if (!ParaNode.isValidStyle(style)) {
    logger?.warn(`Unexpected para style '${style}'!`);
    // Always return with data as other elements need this structure.
  }

  return {
    type: ParaNode.getType(),
    usxStyle: style,
    children: [],
    direction: null,
    format: "",
    indent: 0,
    version: PARA_VERSION,
  };
}

function createNote<TLogger extends LoggerBasic>(
  style: string,
  marker: MarkerObject,
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
  logger: TLogger | undefined,
): SerializedNoteNode | undefined {
  if (!NoteNode.isValidStyle(style)) {
    logger?.error(`Unexpected note style '${style}'!`);
    return undefined;
  }

  const previewText = elementNodes
    .reduce(
      (text, node) => text + (node.type === "char" ? ` ${(node as SerializedTextNode).text}` : ""),
      "",
    )
    .trim();
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: NoteNode.getType(),
    usxStyle: style as NoteUsxStyle,
    caller: marker.caller ?? "*",
    previewText,
    version: NOTE_VERSION,
  };
}

function createText(text: string): SerializedTextNode {
  return {
    type: TextNode.getType(),
    text,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    version: 1,
  };
}

function addNode(
  lexicalNode: SerializedLexicalNode | undefined,
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
) {
  if (lexicalNode) {
    (elementNodes as SerializedLexicalNode[]).push(lexicalNode);
  }
}

function recurseNodes<TLogger extends LoggerBasic>(
  markers: MarkerContent[] | undefined,
  logger: TLogger | undefined,
): (SerializedElementNode | SerializedTextNode)[] {
  const elementNodes: (SerializedElementNode | SerializedTextNode)[] = [];
  markers?.forEach((marker) => {
    if (typeof marker === "string") {
      elementNodes.push(createText(marker));
    } else {
      let lexicalNode: SerializedLexicalNode | undefined;
      let elementNode: SerializedElementNode | undefined;
      const { element, style } = deserializeUsjType(marker.type);
      switch (element) {
        case "book":
          lexicalNode = createBook(style, marker, logger);
          addNode(lexicalNode, elementNodes);
          break;
        case "chapter":
          lexicalNode = createChapter(style, marker, logger);
          addNode(lexicalNode, elementNodes);
          break;
        case "verse":
          lexicalNode = createVerse(style, marker, logger);
          addNode(lexicalNode, elementNodes);
          break;
        case "char":
          lexicalNode = createChar(style, marker, logger);
          addNode(lexicalNode, elementNodes);
          break;
        case "para":
          elementNode = createPara(style, logger);
          if (elementNode) {
            elementNode.children = recurseNodes(marker.content, logger);
            elementNodes.push(elementNode);
          }
          break;
        case "note":
          lexicalNode = createNote(style, marker, recurseNodes(marker.content, logger), logger);
          addNode(lexicalNode, elementNodes);
          break;
        default:
          if (!marker.type || marker.type === "ms") break;
          logger?.error(`Unexpected node type '${marker.type}'!`);
      }
    }
  });
  return elementNodes;
}

/**
 * Insert implied paras as needed.
 *   - Around any book element.
 *   - Any other set of nodes that contain a text element at the root.
 * @param elementNodes - serialized element nodes.
 * @returns nodes with any needed implied paras inserted.
 */
function insertImpliedParasRecurse(
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
): SerializedElementNode[] {
  let nodes = elementNodes;
  const bookNodeIndex = nodes.findIndex((node) => node.type === BookNode.getType());
  if (bookNodeIndex >= 0) {
    const nodesBefore = insertImpliedParasRecurse(nodes.slice(0, bookNodeIndex));
    const bookNode = createImpliedPara([nodes[bookNodeIndex]]);
    const nodesAfter = insertImpliedParasRecurse(nodes.slice(bookNodeIndex + 1));
    nodes = [...nodesBefore, bookNode, ...nodesAfter];
  } else if (nodes.some((node) => "text" in node)) {
    // If there are any text nodes as a child of this root, enclose in an implied para node.
    nodes = [createImpliedPara(nodes)];
  }

  // All root level elements are now SerializedElementNode.
  return nodes as SerializedElementNode[];
}

export function loadEditorState<TLogger extends LoggerBasic>(
  usj: Usj | undefined,
  logger?: TLogger,
): SerializedEditorState {
  let children: SerializedElementNode[];
  if (usj) {
    if (usj.type !== USJ_TYPE)
      logger?.warn(`This USJ type '${usj.type}' didn't match the expected type '${USJ_TYPE}'.`);
    if (usj.version !== USJ_VERSION)
      logger?.warn(
        `This USJ version '${usj.version}' didn't match the expected version '${USJ_VERSION}'.`,
      );

    if (usj.content.length > 0)
      children = insertImpliedParasRecurse(recurseNodes<TLogger>(usj.content, logger));
    else children = [emptyParaNode];
  } else {
    children = [emptyParaNode];
  }

  return {
    root: {
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/**
 * A component (plugin) that updates the state of lexical.
 * @param props - { usj object, logger }
 * @returns null, i.e. no DOM elements.
 */
export default function UpdateStatePlugin<TLogger extends LoggerBasic>({
  usj,
  logger,
}: {
  usj?: Usj;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const serializedEditorState = loadEditorState<TLogger>(usj, logger);
    // const stringifiedEditorState = JSON.stringify(serializedEditorState);
    // logger.log(stringifiedEditorState);
    const editorState = editor.parseEditorState(serializedEditorState);
    // TODO: review use of `queueMicrotask`. It stops an error but why is it necessary?
    queueMicrotask(() => {
      editor.setEditorState(editorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    });
  }, [editor, usj, logger]);

  return null;
}
