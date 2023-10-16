import "./style.css";
import { createEditor } from "lexical";
import { registerRichText } from "@lexical/rich-text";
import { registerEmoticons } from "shared/plugins/emoticons";
import { registerOnChange } from "shared/plugins/onChange";
import ScriptureNodes from "shared/nodes";
import { EmoticonNode } from "shared/nodes/EmoticonNode";
import { getLexicalState } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";

(async () => {
  const config = {
    namespace: "MyEditor",
    theme: {},
    nodes: [...ScriptureNodes, EmoticonNode],
    onError: console.error,
  };
  const lexicalState = await fetchUsfm({
    serverName: "dbl",
    organizationId: "bfbs",
    languageCode: "fra",
    versionId: "lsg",
    bookCode: "tit",
  }).then((usfm) => getLexicalState(usfm));
  //Initialize editor
  const editor = createEditor(config);
  editor.setEditorState(editor.parseEditorState(lexicalState), {
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
})();
