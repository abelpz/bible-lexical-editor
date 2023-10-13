import { useEffect, useState } from "react";
import { usfmText } from "shared/data/tit.usfm";
import { usfm2perf } from "shared/converters/usfmToPerf";
import { transformPerfToLexicalState } from "shared/converters/perfToLexical";
import EpiteleteHtml from "epitelete-html";

//Lots of hardcoded data here.
const perf = usfm2perf(usfmText, {
  serverName: "door43",
  organizationId: "unfoldingWord",
  languageCode: "en",
  versionId: "ult",
});

const bibleHandler = new EpiteleteHtml({
  docSetId: perf.metadata.translation.id,
  options: { historySize: 100 },
});

export function useLexicalState() {
  const [lexicalState, setLexicalState] = useState(null);
  useEffect(() => {
    const readOptions = { readPipeline: "stripAlignmentPipeline" };
    // const writeOptions = { writePipeline: "mergeAlignmentPipeline" };
    bibleHandler.sideloadPerf("RUT", perf, { ...readOptions }).then((perf) => {
      const _lexicalState = transformPerfToLexicalState(
        perf,
        perf.main_sequence_id,
      );
      console.log("Perf to Lexical", { perf, lexicalState: _lexicalState });
      setLexicalState(JSON.stringify(_lexicalState));
    });
  }, [perf]);

  return lexicalState;
}
