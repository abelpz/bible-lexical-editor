/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#note */

import { type LexicalNode, $applyNodeReplacement } from "lexical";
import { ReactNode, createElement } from "react";
import {
  NoteBaseNode,
  NoteUsxStyle,
  SerializedNoteNode,
} from "shared/nodes/scripture/usj/NoteBaseNode";

export {
  NOTE_VERSION,
  type NoteUsxStyle,
  type SerializedNoteNode,
} from "shared/nodes/scripture/usj/NoteBaseNode";

export class NoteNode extends NoteBaseNode<ReactNode> {
  static getType(): string {
    return NoteBaseNode.getType();
  }

  static clone(node: NoteNode): NoteNode {
    return new NoteNode(node.__usxStyle, node.__caller, node.__key);
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    const { usxStyle, caller, previewText, category } = serializedNode;
    const node = $createNoteNode(usxStyle, caller, previewText, category);
    return node;
  }

  decorate(): ReactNode {
    return createElement("a", { onClick: () => false, title: this.__previewText }, this.__caller);
  }

  exportJSON(): SerializedNoteNode {
    return super.exportJSON();
  }
}

export function $createNoteNode(
  usxStyle: NoteUsxStyle,
  caller: string,
  previewText: string,
  category?: string,
): NoteNode {
  return $applyNodeReplacement(new NoteNode(usxStyle, caller, previewText, category));
}

export function $isNoteNode(node: LexicalNode | null | undefined): node is NoteNode {
  return node instanceof NoteNode;
}
