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
  ImmutableVerseNode,
} from "shared/nodes/scripture/usj/ImmutableVerseNode";
import { LoggerBasic } from "./logger-basic.model";

/** empty para node for an 'empty' editor */
const emptyParaNode: SerializedParaNode = createPara(PARA_STYLE_DEFAULT);

let callerCount = 0;
/** Possible note callers to use when caller is '+'. Up to 2 characters are used, e.g. a-zz */
let _noteCallers = [
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
/** logger instance */
let _logger: LoggerBasic;

export function resetCallerCount(resetValue = 0) {
  callerCount = resetValue;
}

/**
 * Get the note caller to use. E.g. for '+' replace with a-z, aa-zz.
 * @param markerCaller - the specified note caller.
 * @returns the specified caller, if '+' replace with up to 2 characters from the possible note
 *   callers list, '*' if undefined.
 */
function getNoteCaller(markerCaller: string | undefined): string {
  let caller = markerCaller;
  if (markerCaller === "+") {
    if (callerCount >= _noteCallers.length ** 2 + _noteCallers.length) {
      resetCallerCount();
      _logger?.warn("Note caller count was reset. Consider adding more possible note callers.");
    }

    const callerIndex = callerCount % _noteCallers.length;
    let callerLeadChar = "";
    if (callerCount >= _noteCallers.length) {
      const callerLeadCharIndex = Math.trunc(callerCount / _noteCallers.length) - 1;
      callerLeadChar = _noteCallers[callerLeadCharIndex];
    }
    caller = callerLeadChar + _noteCallers[callerIndex];
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
  const node = { ...marker };
  delete node.content;

  return {
    ...node,
    type: NoteNode.getType(),
    usxStyle: style as NoteUsxStyle,
    caller: getNoteCaller(marker.caller),
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
        default:
          if (!marker.type || marker.type === "ms") break;
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
 * A component (plugin) that updates the state of lexical when incoming USJ changes.
 * @param props.usj - USJ Scripture data.
 * @param props.noteCallers - Possible note callers to use when caller is '+'.
 * @param props.logger - logger instance
 * @returns null, i.e. no DOM elements.
 */
export default function UpdateStatePlugin<TLogger extends LoggerBasic>({
  usj,
  noteCallers,
  logger,
}: {
  usj?: Usj;
  noteCallers?: string[];
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  if (noteCallers && noteCallers.length > 0) _noteCallers = noteCallers;
  if (logger) _logger = logger;

  useEffect(() => {
    resetCallerCount();
    const serializedEditorState = loadEditorState(usj);
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
