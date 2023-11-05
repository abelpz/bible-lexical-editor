import { LexicalEditor } from "lexical";
import { $createEmoticonNode, EmoticonNode } from "../nodes/EmoticonNode";

function emoticonTransform(node: EmoticonNode) {
  const textContent = node.getTextContent();
  if (textContent === ":)") {
    node.replace($createEmoticonNode("", "🙂"));
  }
}

export function registerEmoticons(editor: LexicalEditor) {
  const removeTransform = editor.registerNodeTransform(EmoticonNode, emoticonTransform);
  return () => {
    removeTransform();
  };
}
