import { EditorConfig, LexicalNode, NodeKey, TextNode } from "lexical";

export class EmoticonNode extends TextNode {
  __className: string;

  static getType(): string {
    return "emoticon";
  }

  static clone(node: EmoticonNode): EmoticonNode {
    return new EmoticonNode(node.__className, node.__text, node.__key);
  }
  constructor(className: string, text: string, key?: NodeKey) {
    super(text, key);
    this.__className = className;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = this.__className;
    return dom;
  }
}

export function $isEmoticonNode(node: LexicalNode | null | undefined): node is EmoticonNode {
  return node instanceof EmoticonNode;
}

export function $createEmoticonNode(className: string, emoticonText: string): EmoticonNode {
  return new EmoticonNode(className, emoticonText).setMode("token");
}
