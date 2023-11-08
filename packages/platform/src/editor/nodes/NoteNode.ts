/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#note */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { ReactNode, createElement } from "react";

/** @see https://ubsicap.github.io/usx/notes.html */
const VALID_NOTE_STYLES = [
  // Footnote
  "f",
  "fe",
  "ef",
  // Cross Reference
  "x",
  "ex",
] as const;

export const NOTE_VERSION = 1;

export type NoteUsxStyle = (typeof VALID_NOTE_STYLES)[number];

export type SerializedNoteNode = Spread<
  {
    usxStyle: NoteUsxStyle;
    caller: string;
    previewText: string;
    category?: string;
  },
  SerializedLexicalNode
>;

export class NoteNode extends DecoratorNode<ReactNode> {
  __usxStyle: NoteUsxStyle;
  __caller: string;
  __previewText: string;
  __category?: string;

  constructor(
    usxStyle: NoteUsxStyle,
    caller: string,
    previewText: string,
    category?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__usxStyle = usxStyle;
    this.__caller = caller;
    this.__previewText = previewText;
    this.__category = category;
  }

  static getType(): string {
    return "note";
  }

  static clone(node: NoteNode): NoteNode {
    return new NoteNode(node.__usxStyle, node.__caller, node.__key);
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    const node = $createNoteNode(
      serializedNode.usxStyle,
      serializedNode.caller,
      serializedNode.previewText,
      serializedNode.category,
    );
    node.setUsxStyle(serializedNode.usxStyle);
    return node;
  }

  static isValidStyle(style: string): boolean {
    return VALID_NOTE_STYLES.includes(style as NoteUsxStyle);
  }

  setUsxStyle(usxStyle: NoteUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): NoteUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setCaller(caller: string): void {
    const self = this.getWritable();
    self.__caller = caller;
  }

  getCaller(): string {
    const self = this.getLatest();
    return self.__caller;
  }

  setPreviewText(previewText: string): void {
    const self = this.getWritable();
    self.__previewText = previewText;
  }

  getPreviewText(): string {
    const self = this.getLatest();
    return self.__previewText;
  }

  setCategory(category: string | undefined): void {
    const self = this.getWritable();
    self.__category = category;
  }

  getCategory(): string | undefined {
    const self = this.getLatest();
    return self.__category;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
    dom.setAttribute("data-caller", this.__caller);
    dom.setAttribute("data-preview-text", this.__previewText);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  decorate(): ReactNode {
    return createElement("a", { onClick: () => false, title: this.__previewText }, this.__caller);
  }

  exportJSON(): SerializedNoteNode {
    return {
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      caller: this.getCaller(),
      previewText: this.getPreviewText(),
      category: this.getCategory(),
      version: NOTE_VERSION,
    };
  }
}

export function $createNoteNode(
  usxStyle: NoteUsxStyle,
  caller: string,
  previewText: string,
  category?: string,
): NoteNode {
  return $applyNodeReplacement(new NoteNode(usxStyle, caller, previewText, category));
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
  return node instanceof NoteNode;
}
