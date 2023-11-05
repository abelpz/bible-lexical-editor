/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#book */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  EditorConfig,
  SerializedTextNode,
  Spread,
  TextNode,
} from "lexical";
import { BookCode } from "../../../converters/usj.model";

export const BOOK_STYLE = "id";
export const BOOK_VERSION = 1;

type BookUsxStyle = typeof BOOK_STYLE;

export type SerializedBookNode = Spread<
  {
    usxStyle: BookUsxStyle;
    code: BookCode;
  },
  SerializedTextNode
>;

export class BookNode extends TextNode {
  __usxStyle: BookUsxStyle;
  __code: BookCode;

  constructor(code: BookCode, text: string, key?: NodeKey) {
    super(text, key);
    this.__usxStyle = BOOK_STYLE;
    this.__code = code;
  }

  static getType(): string {
    return "book";
  }

  static clone(node: BookNode): BookNode {
    return new BookNode(node.__code, node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedBookNode): BookNode {
    const node = $createBookNode(serializedNode.code, serializedNode.text);
    node.setDetail(serializedNode.detail);
    node.setFormat(serializedNode.format);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    node.setUsxStyle(serializedNode.usxStyle);
    return node;
  }

  setUsxStyle(usxStyle: BookUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): BookUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setCode(code: BookCode): void {
    const self = this.getWritable();
    self.__code = code;
  }

  getCode(): BookCode {
    const self = this.getLatest();
    return self.__code;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
    dom.setAttribute("data-code", this.__code);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedBookNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      code: this.getCode(),
      version: BOOK_VERSION,
    };
  }
}

export function $createBookNode(code: BookCode, text: string): BookNode {
  return $applyNodeReplacement(new BookNode(code, text));
}

export function $isBookNode(node: LexicalNode | null | undefined): node is BookNode {
  return node instanceof BookNode;
}
