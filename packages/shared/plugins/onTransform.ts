import ScriptureNodes from "../nodes";
import { LexicalEditor, LexicalNode, TextNode } from "lexical";

export const registerOnTransform = ({
  editor,
  onTransform,
}: {
  editor: LexicalEditor;
  onTransform: boolean;
}) => {
  if (onTransform) {
    console.log("TRANSFORMED");
    const callback = (node: LexicalNode) => {
      console.log({ node });
    };

    const unregisterTransformArray = [TextNode, ...ScriptureNodes].map((Node) =>
      editor.registerNodeTransform(Node, callback),
    );

    return () => unregisterTransformArray.forEach((f) => f());
  }
};
