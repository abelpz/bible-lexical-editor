/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#note */

import { type NodeKey, DecoratorNode, SerializedLexicalNode, Spread } from "lexical";

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

export class NoteBaseNode<T> extends DecoratorNode<T> {
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

  decorate(): T {
    throw new Error("decorate: base method not extended");
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
