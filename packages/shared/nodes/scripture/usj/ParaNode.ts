/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#para */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  ParagraphNode,
  Spread,
  SerializedElementNode,
} from "lexical";
import {
  extractNonNumberedStyles,
  extractNumberedStyles,
  isValidNumberedStyle,
} from "./nodes.util";

export const PARA_STYLE_DEFAULT = "p";

/** @see https://ubsicap.github.io/usx/parastyles.html */
const VALID_PARA_STYLES = [
  // Identification
  "h",
  "toc1",
  "toc2",
  "toc3",
  "toca1",
  "toca2",
  "toca3",
  // Introductions
  "imt#",
  "is#",
  "ip",
  "ipi",
  "ipq",
  "imq",
  "ipr",
  "iq#",
  "ib",
  "ili#",
  "iot",
  "io#",
  "iex",
  "imte",
  "ie",
  // Titles and Headings
  "mt#",
  "mte",
  "cl",
  "cd",
  "ms#",
  "mr",
  "s#",
  "sr",
  "r",
  "d",
  "sp",
  "sd#",
  // Paragraphs
  PARA_STYLE_DEFAULT,
  "m",
  "po",
  "pr",
  "cls",
  "pmo",
  "pm",
  "pmc",
  "pmr",
  "pi#",
  "mi",
  "pc",
  "ph#",
  "lit",
  // Poetry
  "q#",
  "qr",
  "qc",
  "qa",
  "qm#",
  "qd",
  "b",
  // Lists
  "lh",
  "li#",
  "lf",
  "lim#",
  "litl",
] as const;

const VALID_PARA_STYLES_NUMBERED = extractNumberedStyles(VALID_PARA_STYLES);
const VALID_PARA_STYLES_NON_NUMBERED = [
  ...extractNonNumberedStyles(VALID_PARA_STYLES),
  // Include the numbered styles, i.e. not ending in a number since pi (= pi1) is valid.
  ...VALID_PARA_STYLES_NUMBERED,
] as const;

export const PARA_VERSION = 1;

export type ParaUsxStyle = string;

export type SerializedParaNode = Spread<
  {
    usxStyle: ParaUsxStyle;
  },
  SerializedElementNode
>;

export class ParaNode extends ParagraphNode {
  __usxStyle: ParaUsxStyle;

  constructor(usxStyle: ParaUsxStyle = PARA_STYLE_DEFAULT, key?: NodeKey) {
    super(key);
    this.__usxStyle = usxStyle;
  }

  static getType(): string {
    return "para";
  }

  static clone(node: ParaNode): ParaNode {
    return new ParaNode(node.__usxStyle, node.__key);
  }

  static importJSON(serializedNode: SerializedParaNode): ParaNode {
    const node = $createParaNode(serializedNode.usxStyle);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  static isValidStyle(style: string): boolean {
    return (
      VALID_PARA_STYLES_NON_NUMBERED.includes(style) ||
      isValidNumberedStyle(style, VALID_PARA_STYLES_NUMBERED)
    );
  }

  setUsxStyle(usxStyle: ParaUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): ParaUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  createDOM(): HTMLElement {
    // Define the DOM element here
    const dom = document.createElement("p");
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedParaNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      version: PARA_VERSION,
    };
  }
}

export function $createParaNode(usxStyle?: ParaUsxStyle): ParaNode {
  return $applyNodeReplacement(new ParaNode(usxStyle));
}

export function $isParaNode(node: LexicalNode | null | undefined): node is ParaNode {
  return node instanceof ParaNode;
}
