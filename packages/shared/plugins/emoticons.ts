import { $createEmoticonNode } from "../nodes/EmoticonNode";
import { TextNode } from "lexical";

function emoticonTransform(node) {
  const textContent = node.getTextContent();
  console.log("TRANSFORM");
  if (textContent === ":)") {
    node.replace($createEmoticonNode("", "🙂"));
  }
}

export function registerEmoticons(editor) {
  const removeTransform = editor.registerNodeTransform(
    TextNode,
    emoticonTransform,
  );
  return () => {
    removeTransform();
  };
}
