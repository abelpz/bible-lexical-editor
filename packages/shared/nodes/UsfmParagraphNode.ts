import { addClassNamesToElement } from "@lexical/utils";
import { $applyNodeReplacement, EditorConfig, LexicalNode, NodeKey } from "lexical";
import { Attributes, SerializedUsfmElementNode, UsfmElementNode } from "./UsfmElementNode";

export type SerializedUsfmParagraphNode = SerializedUsfmElementNode;

export class UsfmParagraphNode extends UsfmElementNode {
  static getType(): string {
    return "usfmparagraph";
  }

  static clone(node: UsfmParagraphNode): UsfmParagraphNode {
    return new UsfmParagraphNode(node.__attributes, node.__data, node.__tag, node.__key);
  }

  constructor(attributes: Attributes, data: unknown, tag?: string, key?: NodeKey) {
    super(attributes, data, tag, key);
  }

  static importJSON(serializedNode: SerializedUsfmParagraphNode): UsfmParagraphNode {
    const { data, attributes, tag, format, indent, direction } = serializedNode;
    const node = $createUsfmParagraphNode(attributes, data, tag);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const attributes = this.getAttributes() || {};
    const element = document.createElement(this.getTag() || "p");
    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  isInline(): boolean {
    return false;
  }

  exportJSON(): SerializedUsfmParagraphNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: 1,
    };
  }

  updateDOM(): boolean {
    // console.log({ updateDOMProps });
    return false;
  }
}

export function $createUsfmParagraphNode(
  attributes: Attributes,
  data: unknown,
  tag?: string,
): UsfmParagraphNode {
  return $applyNodeReplacement(new UsfmParagraphNode(attributes, data, tag));
}

export function $isUsfmParagraphNode(
  node: LexicalNode | null | undefined,
): node is UsfmParagraphNode {
  return node instanceof UsfmParagraphNode;
}
