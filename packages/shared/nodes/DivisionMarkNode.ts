import { addClassNamesToElement } from "@lexical/utils";
import {
  $applyNodeReplacement,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import { UsfmElementNode } from "./UsfmElementNode";

export type SerializedDivisionMarkNode = Spread<
  {
    attributes: unknown;
    data: unknown;
  },
  SerializedElementNode
>;

export class DivisionMarkNode extends UsfmElementNode {
  static getType() {
    return "divisionmark";
  }

  static clone(node: DivisionMarkNode): DivisionMarkNode {
    return new DivisionMarkNode(node.__attributes, node.__data, node.__key);
  }

  constructor(attributes: unknown, data: unknown, key?: NodeKey) {
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

  createDOM(config: EditorConfig) {
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

  updateDOM() {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }
}

export function $createDivisionMarkNode(attributes: unknown, data: unknown): DivisionMarkNode {
  return $applyNodeReplacement(new DivisionMarkNode(attributes, data));
}

export function $isDivisionMarkNode(
  node: LexicalNode | null | undefined,
): node is DivisionMarkNode {
  return node instanceof DivisionMarkNode;
}
