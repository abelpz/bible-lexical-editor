/** Conforms with USX v3.0 and adapted from @see https://ubsicap.github.io/usx/elements.html#para */

import {
  type LexicalNode,
  $applyNodeReplacement,
  ParagraphNode,
  SerializedElementNode,
} from "lexical";

export const IMPLIED_PARA_VERSION = 1;

export type SerializedImpliedParaNode = SerializedElementNode;

export class ImpliedParaNode extends ParagraphNode {
  static getType(): string {
    return "implied-para";
  }

  static clone(node: ImpliedParaNode): ImpliedParaNode {
    return new ImpliedParaNode(node.__key);
  }

  static importJSON(serializedNode: SerializedImpliedParaNode): ImpliedParaNode {
    const node = $createImpliedParaNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  createDOM(): HTMLElement {
    // Define the DOM element here
    const dom = document.createElement("p");
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedImpliedParaNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: IMPLIED_PARA_VERSION,
    };
  }
}

export function $createImpliedParaNode(): ImpliedParaNode {
  return $applyNodeReplacement(new ImpliedParaNode());
}

export function $isImpliedParaNode(node: LexicalNode | null | undefined): node is ImpliedParaNode {
  return node instanceof ImpliedParaNode;
}
