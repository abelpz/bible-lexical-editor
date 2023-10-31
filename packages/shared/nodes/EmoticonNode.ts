import { TextNode } from "lexical";
import { NodeKey } from "lexical/LexicalNode";

export class EmoticonNode extends TextNode {
  __className: string;

  static getType(): string {
    return "emoticon";
  }

  static clone(node) {
    return new EmoticonNode(node.__className, node.__text, node.__key);
  }
  constructor(className, text, key?: NodeKey) {
    super(text, key);
    this.__className = className;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = this.__className;
    return dom;
  }
}

export function $isEmoticonNode(node) {
  return node instanceof EmoticonNode;
}

export function $createEmoticonNode(className, emoticonText) {
  return new EmoticonNode(className, emoticonText).setMode("token");
}
