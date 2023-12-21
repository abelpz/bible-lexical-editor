import { RefSelector, ScriptureReference } from "papi-components";
import { useState } from "react";
import { usxStringToJson } from "shared/converters/usj/usx-to-usj";
import { WEB_PSA_USX as usx } from "shared/data/WEB-PSA.usx";
// import { PSA_USX as usx } from "shared/data/psa.usfm.usx";
import { UsjNodeOptions } from "./editor/adaptors/usj-editor.adaptor";
import Editor from "./editor/Editor";
import { noteNodeName } from "./editor/nodes/NoteNode";
import "./App.css";

const defaultScrRef: ScriptureReference = { bookNum: 19, /* PSA */ chapterNum: 1, verseNum: 1 };

const usj = usxStringToJson(usx);

const nodeOptions: UsjNodeOptions = { [noteNodeName]: { onClick: () => false } };

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
