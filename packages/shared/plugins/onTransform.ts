import ScriptureNodes from "../nodes";
import { TextNode } from "lexical";

export const registerOnTransform = ({ editor, onTransform }) => {
  if (onTransform) {
    console.log("TRANSFORMED");
    const callback = (node) => {
      console.log({ node });
    };

    const unregisterTransformArray = [TextNode, ...ScriptureNodes].map((Node) =>
      editor.registerNodeTransform(Node, callback),
    );

    return () => unregisterTransformArray.forEach((f) => f());
  }
};
