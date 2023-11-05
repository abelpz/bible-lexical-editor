import { ParagraphNode } from "lexical";
import { BookNode } from "./BookNode";
import { ImmutableChapterNode } from "./ImmutableChapterNode";
import { CharNode } from "./CharNode";
import { ImpliedParaNode } from "./ImpliedParaNode";
import { ParaNode } from "./ParaNode";
import { NoteNode } from "./NoteNode";
import { VerseNode } from "./VerseNode";

const scriptureNodes = [
  BookNode,
  ImmutableChapterNode,
  VerseNode,
  CharNode,
  NoteNode,
  ImpliedParaNode,
  ParaNode,
  {
    replace: ParagraphNode,
    with: () => {
      return new ParaNode();
    },
  },
];
export default scriptureNodes;
