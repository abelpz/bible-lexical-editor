import { addClassNamesToElement } from "@lexical/utils";
import { $applyNodeReplacement } from "lexical";
import { UsfmElementNode } from "./UsfmElementNode";

export class UsfmParagraphNode extends UsfmElementNode {
  static getType() {
    return "usfmparagraph";
  }

  static clone(node) {
    return new UsfmParagraphNode(
      node.__attributes,
      node.__data,
      node.__tag,
      node.__key,
    );
  }

  constructor(attributes, data, tag, key) {
    super(attributes, data, tag || "p", key);
  }

  static importJSON(serializedNode) {
    const { data, attributes, tag, format, indent, direction } = serializedNode;
    const node = $createUsfmParagraphNode(attributes, data, tag);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  createDOM(config) {
    const attributes = this.getAttributes() || {};
    const element = document.createElement(this.getTag());
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  isInline() {
    return false;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "usfmparagraph",
      version: 1,
    };
  }

  updateDOM(...updateDOMProps) {
    console.log({ updateDOMProps });
    return false;
  }
}

export function $createUsfmParagraphNode(attributes, data, tag) {
  return $applyNodeReplacement(new UsfmParagraphNode(attributes, data, tag));
}

export function $isUsfmParagraphNode(node) {
  return node instanceof UsfmParagraphNode;
}
