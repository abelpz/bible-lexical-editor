import "./style.css";
import { createEditor } from "lexical";
import { registerRichText } from "@lexical/rich-text";
import ScriptureNodes from "shared/nodes";

import("shared/contentManager").then(async ({ lexicalState }) => {
  const config = {
    namespace: "MyEditor",
    theme: {},
    nodes: [...ScriptureNodes],
    onError: console.error,
  };

  const editor = createEditor(config);
  const parsedEditorState = editor.parseEditorState(await lexicalState);
  editor.setEditorState(parsedEditorState, { tag: "history-merge" });
  const contentEditableElement = document.getElementById("editor");
  editor.setRootElement(contentEditableElement);
  registerRichText(editor);
});
