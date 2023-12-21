import {
  SerializedEditorState,
  SerializedElementNode,
  SerializedLexicalNode,
  SerializedTextNode,
  TextNode,
} from "lexical";
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
  MILESTONE_VERSION,
  MilestoneNode,
  MilestoneUsxStyle,
  SerializedMilestoneNode,
} from "shared/nodes/scripture/usj/MilestoneNode";
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
import {
  NOTE_VERSION,
  NoteNode,
  NoteUsxStyle,
  OnClick,
  SerializedNoteNode,
  noteNodeName,
} from "../nodes/NoteNode";
import {
  SerializedVerseNode,
  VERSE_STYLE,
  VERSE_VERSION,
  ImmutableVerseNode,
} from "shared/nodes/scripture/usj/ImmutableVerseNode";
import { EditorAdaptor, NodeOptions } from "./editor-adaptor.model";
import { LoggerBasic } from "../plugins/logger-basic.model";

export interface UsjNodeOptions extends NodeOptions {
  [noteNodeName]?: {
    noteCallers?: string[];
    onClick?: OnClick;
  };
}

interface UsjEditorAdaptor extends EditorAdaptor {
  initialize: typeof initialize;
  reset: typeof reset;
  loadEditorState: typeof loadEditorState;
}

/** empty para node for an 'empty' editor */
const emptyParaNode: SerializedParaNode = createPara(PARA_STYLE_DEFAULT);
/** Possible note callers to use when caller is '+'. Up to 2 characters are used, e.g. a-zz */
const defaultNoteCallers = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

/** Options for each node. */
let _nodeOptions: UsjNodeOptions = {};
/** Count used for note callers */
let callerCount = 0;
/** logger instance */
let _logger: LoggerBasic;

export function initialize(
  nodeOptions: UsjNodeOptions | undefined,
  logger: LoggerBasic | undefined,
) {
  setNodeOptions(nodeOptions);
  setLogger(logger);
}

export function reset(callerCountValue = 0) {
  resetCallerCount(callerCountValue);
}

export function loadEditorState(usj: Usj | undefined): SerializedEditorState {
  let children: SerializedElementNode[];
  if (usj) {
    if (usj.type !== USJ_TYPE)
      _logger?.warn(`This USJ type '${usj.type}' didn't match the expected type '${USJ_TYPE}'.`);
    if (usj.version !== USJ_VERSION)
      _logger?.warn(
        `This USJ version '${usj.version}' didn't match the expected version '${USJ_VERSION}'.`,
      );

    if (usj.content.length > 0) children = insertImpliedParasRecurse(recurseNodes(usj.content));
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
 * Set the node options.
 * @param nodeOptions - Node options.
 */
function setNodeOptions(nodeOptions: UsjNodeOptions | undefined) {
  if (nodeOptions) _nodeOptions = nodeOptions;
}

/**
 * Set the logger to use if needed when loading Scripture data to editor state.
 * @param logger - Logger to use.
 */
function setLogger(logger: LoggerBasic | undefined) {
  if (logger) _logger = logger;
}

/**
 * Reset the count used for note callers.
 * @param resetValue - Value to reset to. Defaults to 0.
 */
function resetCallerCount(resetValue = 0) {
  callerCount = resetValue;
}

/**
 * Get the note caller to use. E.g. for '+' replace with a-z, aa-zz.
 * @param markerCaller - the specified note caller.
 * @returns the specified caller, if '+' replace with up to 2 characters from the possible note
 *   callers list, '*' if undefined.
 */
function getNoteCaller(markerCaller: string | undefined): string {
  const optionsNoteCallers = _nodeOptions[noteNodeName]?.noteCallers;
  const noteCallers =
    optionsNoteCallers && optionsNoteCallers.length > 0 ? optionsNoteCallers : defaultNoteCallers;
  let caller = markerCaller;
  if (markerCaller === "+") {
    if (callerCount >= noteCallers.length ** 2 + noteCallers.length) {
      resetCallerCount();
      _logger?.warn("Note caller count was reset. Consider adding more possible note callers.");
    }

    const callerIndex = callerCount % noteCallers.length;
    let callerLeadChar = "";
    if (callerCount >= noteCallers.length) {
      const callerLeadCharIndex = Math.trunc(callerCount / noteCallers.length) - 1;
      callerLeadChar = noteCallers[callerLeadCharIndex];
    }
    caller = callerLeadChar + noteCallers[callerIndex];
    callerCount += 1;
  }
  return caller ?? "*";
}

function getTextContent(markers: MarkerContent[] | undefined): string {
  if (!markers || markers.length !== 1 || typeof markers[0] !== "string") return "";

  return markers[0];
}

function createBook(style: string, marker: MarkerObject): SerializedBookNode | undefined {
  if (!marker.code) {
    _logger?.error(`Unexpected book code '${marker.code}'!`);
    return undefined;
  }
  if (style !== BOOK_STYLE) {
    _logger?.error(`Unexpected book style '${style}'!`);
    return undefined;
  }

  return {
    type: BookNode.getType(),
    usxStyle: BOOK_STYLE,
    code: marker.code,
    text: getTextContent(marker.content),
    children: [],
    direction: null,
    format: "",
    indent: 0,
    version: BOOK_VERSION,
  };
}

function createChapter(style: string, marker: MarkerObject): SerializedChapterNode | undefined {
  if (style !== CHAPTER_STYLE) {
    _logger?.error(`Unexpected chapter style '${style}'!`);
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

function createVerse(style: string, marker: MarkerObject): SerializedVerseNode | undefined {
  if (style !== VERSE_STYLE) {
    _logger?.error(`Unexpected verse style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: ImmutableVerseNode.getType(),
    usxStyle: VERSE_STYLE,
    number: marker.number ?? "",
    version: VERSE_VERSION,
  };
}

function createChar(style: string, marker: MarkerObject): SerializedCharNode | undefined {
  if (!CharNode.isValidStyle(style)) {
    _logger?.error(`Unexpected char style '${style}'!`);
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

function createPara(style: string): SerializedParaNode {
  if (!ParaNode.isValidStyle(style)) {
    _logger?.warn(`Unexpected para style '${style}'!`);
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

function createNote(
  style: string,
  marker: MarkerObject,
  elementNodes: (SerializedElementNode | SerializedTextNode)[],
): SerializedNoteNode | undefined {
  if (!NoteNode.isValidStyle(style)) {
    _logger?.error(`Unexpected note style '${style}'!`);
    return undefined;
  }

  const previewText = elementNodes
    .reduce(
      (text, node) => text + (node.type === "char" ? ` ${(node as SerializedTextNode).text}` : ""),
      "",
    )
    .trim();
  const onClick = (_nodeOptions[NoteNode.name]?.onClick as OnClick) ?? (() => false);
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: NoteNode.getType(),
    usxStyle: style as NoteUsxStyle,
    caller: getNoteCaller(marker.caller),
    previewText,
    onClick,
    version: NOTE_VERSION,
  };
}

function createMilestone(style: string, marker: MarkerObject): SerializedMilestoneNode | undefined {
  if (!MilestoneNode.isValidStyle(style)) {
    _logger?.error(`Unexpected milestone style '${style}'!`);
    return undefined;
  }
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: MilestoneNode.getType(),
    usxStyle: style as MilestoneUsxStyle,
    version: MILESTONE_VERSION,
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

function recurseNodes(
  markers: MarkerContent[] | undefined,
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
          lexicalNode = createBook(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        case "chapter":
          lexicalNode = createChapter(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        case "verse":
          lexicalNode = createVerse(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        case "char":
          lexicalNode = createChar(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        case "para":
          elementNode = createPara(style);
          if (elementNode) {
            elementNode.children = recurseNodes(marker.content);
            elementNodes.push(elementNode);
          }
          break;
        case "note":
          if (marker.caller === "-") break;

          lexicalNode = createNote(style, marker, recurseNodes(marker.content));
          addNode(lexicalNode, elementNodes);
          break;
        case "ms":
          lexicalNode = createMilestone(style, marker);
          addNode(lexicalNode, elementNodes);
          break;
        default:
          if (!marker.type) break;
          _logger?.error(`Unexpected node type '${marker.type}'!`);
      }
    }
  });
  return elementNodes;
}

/**
 * Insert implied paras around any other set of nodes that contain a text element at the root.
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
    const bookNode = nodes[bookNodeIndex];
    const nodesAfter = insertImpliedParasRecurse(nodes.slice(bookNodeIndex + 1));
    nodes = [...nodesBefore, bookNode, ...nodesAfter];
  } else if (nodes.some((node) => "text" in node && "mode" in node)) {
    // If there are any text nodes as a child of this root, enclose in an implied para node.
    nodes = [createImpliedPara(nodes)];
  }

  // All root level elements are now SerializedElementNode.
  return nodes as SerializedElementNode[];
}

const usjEditorAdaptor: UsjEditorAdaptor = {
  initialize,
  reset,
  loadEditorState,
};
export default usjEditorAdaptor;
