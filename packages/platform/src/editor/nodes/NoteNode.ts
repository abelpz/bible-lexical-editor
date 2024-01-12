/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#note */

import { type LexicalNode, $applyNodeReplacement, NodeKey, Spread } from "lexical";
import { ReactNode, createElement } from "react";
import {
  NoteBaseNode,
  NoteUsxStyle,
  SerializedNoteBaseNode,
} from "shared/nodes/scripture/usj/NoteBaseNode";

export type OnClick = () => boolean;

export { NOTE_VERSION, type NoteUsxStyle } from "shared/nodes/scripture/usj/NoteBaseNode";

export type SerializedNoteNode = Spread<
  {
    onClick?: OnClick;
  },
  SerializedNoteBaseNode
>;

export class NoteNode extends NoteBaseNode<ReactNode> {
  __onClick: OnClick;

  constructor(
    usxStyle: NoteUsxStyle,
    caller: string,
    previewText: string,
    onClick?: OnClick,
    category?: string,
    key?: NodeKey,
  ) {
    super(usxStyle, caller, previewText, category, key);
    this.__onClick = onClick ?? (() => false);
  }

  static getType(): string {
    return NoteBaseNode.getType();
  }

  static clone(node: NoteNode): NoteNode {
    const { __usxStyle, __caller, __previewText, __onClick, __category } = node;
    return new NoteNode(__usxStyle, __caller, __previewText, __onClick, __category, node.__key);
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    const { usxStyle, caller, previewText, onClick, category } = serializedNode;
    const node = $createNoteNode(usxStyle, caller, previewText, onClick, category);
    return node;
  }

  setOnClick(onClick: OnClick): void {
    const self = this.getWritable();
    self.__onClick = onClick;
  }

  getOnClick(): OnClick {
    const self = this.getLatest();
    return self.__onClick;
  }

  decorate(): ReactNode {
    return createElement(
      "a",
      { onClick: this.__onClick, title: this.__previewText },
      this.__caller,
    );
  }

  exportJSON(): SerializedNoteNode {
    return { ...super.exportJSON(), onClick: this.getOnClick() };
  }
}

export const noteNodeName = Symbol.for(NoteNode.name);

export function $createNoteNode(
  usxStyle: NoteUsxStyle,
  caller: string,
  previewText: string,
  onClick?: OnClick,
  category?: string,
): NoteNode {
  return $applyNodeReplacement(new NoteNode(usxStyle, caller, previewText, onClick, category));
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
  return node instanceof NoteNode;
}
