import { useEffect, useState } from "react";
import { getLexicalState } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";

export function useLexicalState() {
  const [lexicalState, setLexicalState] = useState(null);
  useEffect(() => {
    fetchUsfm({
      serverName: "dbl",
      organizationId: "bfbs",
      languageCode: "fra",
      versionId: "lsg",
      bookCode: "tit",
    }).then(async (usfm) => {
      setLexicalState(await getLexicalState(usfm));
    });
  }, []);

  return lexicalState;
}
