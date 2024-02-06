import {
  EditorState,
  LexicalEditor,
  // $getSelection,
  $getNodeByKey,
} from "lexical";
import { UsfmElementNode } from "../nodes/UsfmElementNode";

export const registerOnChange = ({
  editor,
  onChange,
  ignoreHistoryMergeTagChange = true,
  ignoreSelectionChange = true,
}: {
  editor: LexicalEditor;
  onChange: (changeProps: {
    editorState: EditorState;
    tags: Set<string>;
    dirtyElements: Map<string, boolean>;
    dirtyLeaves: Set<string>;
  }) => void;
  ignoreHistoryMergeTagChange: boolean;
  ignoreSelectionChange: boolean;
}) => {
  if (onChange) {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (
          (ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
          (ignoreHistoryMergeTagChange && tags.has("history-merge")) ||
          prevEditorState.isEmpty()
        ) {
          return;
        }

        // prevEditorState.read(() => {
        //   console.log("PREVSTATE");
        //   for (const [nodeKey] of dirtyElements) {
        //     const node = prevEditorState._nodeMap.get(nodeKey);
        //     const path = node?.__data?.path;
        //     if (path) console.log("node with path changed", { path, node });
        //     if (!path) console.log("node deleted?", { path, node });
        //   }
        // });
        // // console.log("OUT OF READ", $getSelection());
        // editorState.read(() => {
        //   console.log("CURRSTATE");
        //   for (const [nodeKey] of dirtyElements) {
        //     const node = editorState._nodeMap.get(nodeKey);
        //     const path = node?.__data?.path;
        //     if (path) console.log("node with path changed", { path, node });
        //     if (!path) console.log("node deleted?", { path, node });
        //   }
        // });

        prevEditorState.read(() => {
          console.log("PREVSTATE");
          for (const nodeKey of dirtyLeaves) {
            const node = $getNodeByKey(nodeKey);
            const parentNode = node?.getParent<UsfmElementNode>?.();
            console.log({ node });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { path } = (parentNode?.getData?.() ?? {}) as any;
            if (path) console.log("node with path changed", { path, node, parentNode });
            if (!path) console.log("node deleted?", { path, node, parentNode });
          }
        });
        // console.log("OUT OF READ", $getSelection());
        editorState.read(() => {
          console.log("CURRSTATE");
          for (const nodeKey of dirtyLeaves) {
            const node = $getNodeByKey(nodeKey);
            const parentNode = node?.getParent<UsfmElementNode>?.();
            // console.log({ node });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { path } = (parentNode?.getData?.() ?? {}) as any;
            if (path) console.log("node with path changed", { path, node, parentNode });
            if (!path) console.log("node deleted?", { path, node, parentNode });
          }
        });
        onChange({ editorState, tags, dirtyElements, dirtyLeaves });
      },
    );
  }
};
