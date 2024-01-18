import { RefSelector, ScriptureReference } from "papi-components";
import { useState } from "react";
import { usxStringToJson } from "shared/converters/usj/usx-to-usj";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { noteNodeName } from "shared-react/nodes/scripture/usj/NoteNode";
import { UsjNodeOptions } from "./editor/adaptors/usj-editor.adaptor";
import Editor from "./editor/Editor";
import "./App.css";

const defaultScrRef: ScriptureReference = { /* PSA */ bookNum: 19, chapterNum: 1, verseNum: 1 };

const usj = usxStringToJson(usx);

const nodeOptions: UsjNodeOptions = { [noteNodeName]: { onClick: () => undefined } };

export default function App() {
  const [scrRef, setScrRef] = useState(defaultScrRef);

  return (
    <>
      <div className="ref-selector">
        <RefSelector handleSubmit={setScrRef} scrRef={scrRef} />
      </div>
      <Editor
        usj={usj}
        scrRefState={[scrRef, setScrRef]}
        nodeOptions={nodeOptions}
        logger={console}
      />
    </>
  );
}
