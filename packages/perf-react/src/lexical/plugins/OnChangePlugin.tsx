import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

//Lots of experimenting here.
export const OnChangePlugin = ({ onChange }: { onChange: (props: unknown) => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener((listener) => {
      if (listener.dirtyElements.size > 0) {
        console.log("DIRTY ELEMENTS", {
          dirtyElements: listener.dirtyElements,
        });
        onChange({ editor, listener });
        for (const [nodeKey] of listener.dirtyElements) {
          const node = listener.editorState._nodeMap.get(nodeKey);
          const path = node?.__data?.path;
          if (path) console.log("node with path changed", { path, node });
        }
      }
      if (listener.dirtyLeaves.size > 0) {
        console.log("DIRTY LEAVES", {
          dirtyLeaves: listener.dirtyLeaves,
        });
        for (const nodeKey of listener.dirtyLeaves) {
          const node = listener.editorState._nodeMap.get(nodeKey);
          console.log({ node });
        }
      }
    });
  }, [editor, onChange]);

  return null;
};
