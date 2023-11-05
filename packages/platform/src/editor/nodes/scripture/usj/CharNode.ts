/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#char */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  TextNode,
  SerializedTextNode,
  Spread,
  EditorConfig,
} from "lexical";
import {
  extractNonNumberedStyles,
  extractNumberedStyles,
  isValidNumberedStyle,
} from "./nodes.util";

/**
 * @see https://ubsicap.github.io/usx/charstyles.html
 * @see https://ubsicap.github.io/usx/notes.html
 */
const VALID_CHAR_STYLES = [
  // Special Text
  "add",
  "bk",
  "dc",
  "ior",
  "iqt",
  "k",
  "litl",
  "nd",
  "ord",
  "pn",
  "png",
  "qac",
  "qs",
  "qt",
  "rq",
  "sig",
  "sls",
  "tl",
  "wj",
  // Character Styling
  "em",
  "bd",
  "bdit",
  "it",
  "no",
  "sc",
  "sup",
  // Special Features
  "rb",
  "pro",
  "w",
  "wg",
  "wh",
  "wa",
  // Structured List Entries
  "lik",
  "liv#",
  // Linking
  "jmp",

  // Footnote
  "fr",
  "ft",
  "fk",
  "fq",
  "fqa",
  "fl",
  "fw",
  "fp",
  "fv",
  "fdc",
  // Cross Reference
  "xo",
  "xop",
  "xt",
  "xta",
  "xk",
  "xq",
  "xot",
  "xnt",
  "xdc",
] as const;

const VALID_CHAR_STYLES_NUMBERED = extractNumberedStyles(VALID_CHAR_STYLES);
const VALID_CHAR_STYLES_NON_NUMBERED = [
  ...extractNonNumberedStyles(VALID_CHAR_STYLES),
  // Include the numbered styles, i.e. not ending in a number since pi (= pi1) is valid.
  ...VALID_CHAR_STYLES_NUMBERED,
] as const;

export const CHAR_VERSION = 1;

export type CharUsxStyle = string;

export type SerializedCharNode = Spread<
  {
    usxStyle: CharUsxStyle;
  },
  SerializedTextNode
>;

export class CharNode extends TextNode {
  __usxStyle: CharUsxStyle;

  constructor(text: string, usxStyle: CharUsxStyle, key?: NodeKey) {
    super(text, key);
    this.__usxStyle = usxStyle;
  }

  static getType(): string {
    return "char";
  }

  static clone(node: CharNode): CharNode {
    return new CharNode(node.__text, node.__usxStyle, node.__key);
  }

  static importJSON(serializedNode: SerializedCharNode): CharNode {
    const node = $createCharNode(serializedNode.text, serializedNode.usxStyle);
    node.setDetail(serializedNode.detail);
    node.setFormat(serializedNode.format);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  static isValidStyle(style: string): boolean {
    return (
      VALID_CHAR_STYLES_NON_NUMBERED.includes(style) ||
      isValidNumberedStyle(style, VALID_CHAR_STYLES_NUMBERED)
    );
  }

  setUsxStyle(usxStyle: CharUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): CharUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedCharNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      version: CHAR_VERSION,
    };
  }
}

export function $createCharNode(text: string, usxStyle: CharUsxStyle): CharNode {
  return $applyNodeReplacement(new CharNode(text, usxStyle));
}

export function $isCharNode(node: LexicalNode | null | undefined): node is CharNode {
  return node instanceof CharNode;
}
