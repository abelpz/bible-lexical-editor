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
  editor.setEditorState(editor.parseEditorState(await lexicalState), {
    tag: "history-merge",
  });
  editor.setRootElement(document.getElementById("editor"));
  registerRichText(editor);
});
