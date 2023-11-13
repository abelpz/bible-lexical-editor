import { addClassNamesToElement } from "@lexical/utils";
import { $applyNodeReplacement, EditorConfig, LexicalNode, NodeKey } from "lexical";
import { Attributes, SerializedUsfmElementNode, UsfmElementNode } from "./UsfmElementNode";

export type SerializedDivisionMarkNode = SerializedUsfmElementNode;

export class DivisionMarkNode extends UsfmElementNode {
  static getType(): string {
    return "divisionmark";
  }

  static clone(node: DivisionMarkNode): DivisionMarkNode {
    return new DivisionMarkNode(node.__attributes, node.__data, node.__key);
  }

  constructor(attributes: Attributes, data: unknown, key?: NodeKey) {
    // TODO: define this value. This was added because previously `super` was passed `key` as `tag`.
    const tag = "";
    super(attributes, data, tag, key);
  }

  static importJSON(serializedNode: SerializedDivisionMarkNode) {
    const { data, attributes, format, indent, direction } = serializedNode;
    const node = $createDivisionMarkNode(attributes, data);
    node.setData(data);
    node.setAttributes(attributes);
    node.setFormat(format);
    node.setIndent(indent);
    node.setDirection(direction);
    return node;
  }

  createDOM(config: EditorConfig): HTMLSpanElement {
    const element = document.createElement("span");
    const attributes = this.getAttributes();

    Object.keys(attributes).forEach((attKey) => {
      element.setAttribute(attKey, attributes[attKey]);
    });
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  isInline(): boolean {
    return true;
  }

  exportJSON(): SerializedDivisionMarkNode {
    return {
      ...super.exportJSON(),
      type: "divisionmark",
      version: 1,
    };
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }
}

export function $createDivisionMarkNode(attributes: Attributes, data: unknown): DivisionMarkNode {
  return $applyNodeReplacement(new DivisionMarkNode(attributes, data));
}

export function $isDivisionMarkNode(
  node: LexicalNode | null | undefined,
): node is DivisionMarkNode {
  return node instanceof DivisionMarkNode;
}
