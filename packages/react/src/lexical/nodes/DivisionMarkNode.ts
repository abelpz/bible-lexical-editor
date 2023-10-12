import { addClassNamesToElement } from "@lexical/utils";
import { $applyNodeReplacement } from "lexical";
import { UsfmElementNode } from "./UsfmElementNode";

export class DivisionMarkNode extends UsfmElementNode {
  static getType() {
    return "divisionmark";
  }

  static clone(node) {
    return new DivisionMarkNode(node.__attributes, node.__data, node.__key);
  }

  constructor(attributes, data, key) {
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
}

export function $createDivisionMarkNode(attributes, data) {
  return $applyNodeReplacement(new DivisionMarkNode(attributes, data));
}

export function $isDivisionMarkNode(node) {
  return node instanceof DivisionMarkNode;
}
