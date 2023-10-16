import { addClassNamesToElement } from "@lexical/utils";
import { $applyNodeReplacement } from "lexical";
import { NodeKey } from "lexical/LexicalNode";
import { UsfmElementNode } from "./UsfmElementNode";

export class DivisionMarkNode extends UsfmElementNode {
  static getType() {
    return "divisionmark";
  }

  static clone(node) {
    return new DivisionMarkNode(node.__attributes, node.__data, node.__key);
  }

  constructor(attributes, data, key?: NodeKey) {
    super(attributes, data, key);
  }

  static importJSON(serializedNode) {
    const { data, attributes, format, indent, direction } = serializedNode;
    const node = $createDivisionMarkNode(attributes, data);
    node.setData(data);
    node.setAttributes(attributes);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  createDOM(config) {
    const element = document.createElement("span");
    const attributes = this.getAttributes();

    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  isInline() {
    return true;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "divisionmark",
      version: 1,
    };
  }

  updateDOM(prevNode, dom) {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }
}

export function $createDivisionMarkNode(attributes, data) {
  return $applyNodeReplacement(new DivisionMarkNode(attributes, data));
}

export function $isDivisionMarkNode(node) {
  return node instanceof DivisionMarkNode;
}
