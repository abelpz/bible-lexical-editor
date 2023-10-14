import "./style.css";
import { createEditor } from "lexical";
import { registerRichText } from "@lexical/rich-text";
import { registerEmoticons } from "shared/plugins/emoticons";
import { registerOnChange } from "shared/plugins/onChange";
import ScriptureNodes from "shared/nodes";
import { EmoticonNode } from "shared/nodes/EmoticonNode";

import("shared/contentManager").then(async ({ lexicalState }) => {
  const config = {
    namespace: "MyEditor",
    theme: {},
    nodes: [...ScriptureNodes, EmoticonNode],
    onError: console.error,
  };

  //Initialize editor
  const editor = createEditor(config);
  editor.setEditorState(editor.parseEditorState(await lexicalState), {
    tag: "history-merge",
  });
  editor.setRootElement(document.getElementById("editor"));

  //Register Plugins
  registerRichText(editor);
  registerEmoticons(editor);
  registerOnChange({
    editor,
    onChange: ({ editorState, dirtyElements, dirtyLeaves }) => {
      console.log({ dirtyElements, editorState });
    },
  });
});
