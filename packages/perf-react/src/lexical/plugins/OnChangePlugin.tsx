import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, LexicalEditor } from "lexical";
import { UsfmElementNode } from "shared/nodes/UsfmElementNode";

export type OnChange = (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void;

//Lots of experimenting here.
export const OnChangePlugin = ({ onChange }: { onChange: OnChange }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, tags }) => {
      if (dirtyElements.size > 0) {
        console.log("DIRTY ELEMENTS", {
          dirtyElements,
        });
        onChange(editorState, editor, tags);
        for (const [nodeKey] of dirtyElements) {
          const node = editorState._nodeMap.get(nodeKey);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const path = ((node as UsfmElementNode)?.__data as any)?.path;
          if (path) console.log("node with path changed", { path, node });
        }
      }
      if (dirtyLeaves.size > 0) {
        console.log("DIRTY LEAVES", {
          dirtyLeaves,
        });
        for (const nodeKey of dirtyLeaves) {
          const node = editorState._nodeMap.get(nodeKey);
          console.log({ node });
        }
      }
    });
  }, [editor, onChange]);

  return null;
};
