import { InlineNode } from "../nodes/InlineNode";

export const registerOnMutation = ({ editor, onMutation }) => {
  if (onMutation) {
    console.log("MUTATED");
    return editor.registerMutationListener(InlineNode, (mutatedNodes) => {
      console.log({ mutatedNodes });
      // mutatedNodes is a Map where each key is the NodeKey, and the value is the state of mutation.
      for (let [nodeKey, mutation] of mutatedNodes) {
        console.log({ nodeKey, mutation });
      }
    });
  }
};
