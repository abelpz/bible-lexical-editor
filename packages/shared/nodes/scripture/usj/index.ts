import { ParagraphNode } from "lexical";
import { BookNode } from "./BookNode";
import { ImmutableChapterNode } from "./ImmutableChapterNode";
import { CharNode } from "./CharNode";
import { ImpliedParaNode } from "./ImpliedParaNode";
import { ParaNode } from "./ParaNode";
import { VerseNode } from "./VerseNode";

const scriptureUsjNodes = [
  BookNode,
  ImmutableChapterNode,
  VerseNode,
  CharNode,
  ImpliedParaNode,
  ParaNode,
  {
    replace: ParagraphNode,
    with: () => {
      return new ParaNode();
    },
  },
];
export default scriptureUsjNodes;
