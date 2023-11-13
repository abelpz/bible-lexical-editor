import { $applyNodeReplacement } from "lexical";
import { UsfmElementNode } from "./UsfmElementNode";
import { addClassNamesToElement } from "@lexical/utils";

export class InlineNode extends UsfmElementNode {
  constructor(attributes, data, key) {
    super(attributes, data, key);
  }

  static getType() {
    return "inline";
  }

  static clone(node) {
    return new InlineNode(node.__attributes, node.__data, node.__key);
  }

  isInline() {
    return true;
  }

  createDOM(config) {
    const element = document.createElement("span");
    const attributes = this.getAttributes() ?? {};
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  static importJSON(serializedNode) {
    const { attributes, data, format, indent, direction } = serializedNode;
    const node = $createInlineNode(attributes, data);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "inline",
      version: 1,
    };
  }

  updateDOM() {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }
}

function $createInlineNode(attributes, data) {
  return $applyNodeReplacement(new InlineNode(attributes, data));
}
