import { useEffect, useState } from "react";

export function useLexicalState() {
  const [lexicalState, setLexicalState] = useState(null);
  useEffect(() => {
    // const writeOptions = { writePipeline: "mergeAlignmentPipeline" };
    import("shared/contentManager").then(async ({ lexicalState }) => {
      setLexicalState(await lexicalState);
    });
  }, []);

  return lexicalState;
}
