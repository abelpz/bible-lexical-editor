import { $applyNodeReplacement } from "lexical";
import { UsfmElementNode } from "./UsfmElementNode";
import { addClassNamesToElement } from "@lexical/utils";

export class GraftNode extends UsfmElementNode {
  constructor(attributes, data, tag, key) {
    super(attributes, data, tag || "span", key);
  }

  static getType() {
    return "graft";
  }

  static clone(node) {
    return new GraftNode(node.__attributes, node.__data, node.__tag, node.__key);
  }

  isInline() {
    return true;
  }

  createDOM(config) {
    const element = document.createElement(this.getTag());
    const attributes = this.getAttributes() ?? {};
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  static importJSON(serializedNode) {
    const { attributes, data, format, indent, direction, tag } = serializedNode;
    const node = $createGraftNode(attributes, data, tag);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "graft",
      version: 1,
    };
  }

  updateDOM() {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }
}

function $createGraftNode(attributes, data, tag) {
  return $applyNodeReplacement(new GraftNode(attributes, data, tag));
}
