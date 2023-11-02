import "./style.css";
import { createEditor } from "lexical";
import { registerRichText } from "@lexical/rich-text";
import { registerEmoticons } from "shared/plugins/emoticons";
// import { registerOnChange } from "shared/plugins/onChange";
import { registerOnTransform } from "shared/plugins/onTransform";

// import { registerOnMutation } from "shared/plugins/onMutation";

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

  //Register Plugins
  registerRichText(editor);
  registerEmoticons(editor);
  registerOnTransform({ editor, onTransform: () => null });
  // registerOnChange({
  //   editor,
  //   onChange: ({ editorState, dirtyElements, dirtyLeaves }) => {
  //     console.log({ dirtyElements, editorState });
  //   },
  // });
  // registerOnMutation({
  //   editor,
  //   onMutation: () => {},
  // });
  editor.setRootElement(document.getElementById("editor"));
})();
