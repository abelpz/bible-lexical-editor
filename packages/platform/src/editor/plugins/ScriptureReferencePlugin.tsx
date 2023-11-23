import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { ScriptureReference } from "papi-components";
import { useEffect } from "react";
import { $isBookNode, BookNode } from "shared/nodes/scripture/usj/BookNode";
import {
  findChapter,
  findNextChapter,
  findThisChapter,
  findThisVerse,
  findVerse,
  removeNodeAndAfter,
  removeNodesBeforeNode,
} from "shared/nodes/scripture/usj/node.utils";

/** Prevents the cursor being moved again after a selection has changed. */
let hasSelectionChanged = false;

/**
 * A component (plugin) that keeps the Scripture reference updated.
 * @param props.scrRefState - Scripture reference state object containing the ref and the function
 *   to set it.
 * @returns null, i.e. no DOM elements.
 */
export default function ScriptureReferencePlugin({
  scrRefState,
}: {
  scrRefState: [
    scrRef: ScriptureReference,
    setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>,
  ];
}): null {
  const [editor] = useLexicalComposerContext();
  const [{ bookNum, chapterNum, verseNum }, setScrRef] = scrRefState;

  // Book loaded or changed
  useEffect(
    () =>
      editor.registerMutationListener(BookNode, (nodeMutations) => {
        editor.update(() => {
          for (const [nodeKey, mutation] of nodeMutations) {
            const bookNode = $getNodeByKey<BookNode>(nodeKey);
            if (bookNode && $isBookNode(bookNode) && mutation === "created") {
              moveCursorToVerseStart(chapterNum, verseNum);
            }
          }
        });
      }),
    [editor, chapterNum, verseNum],
  );

  // Scripture Ref changed
  useEffect(() => {
    editor.update(() => {
      if (!hasSelectionChanged) moveCursorToVerseStart(chapterNum, verseNum);
      else hasSelectionChanged = false;
    });
  }, [editor, chapterNum, verseNum]);

  // selection changed
  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => findAndSetChapterAndVerse(bookNum, chapterNum, verseNum, setScrRef),
        COMMAND_PRIORITY_LOW,
      ),
    [editor, bookNum, chapterNum, verseNum, setScrRef],
  );

  return null;
}

function moveCursorToVerseStart(chapterNum: number, verseNum: number) {
  const children = $getRoot().getChildren();
  const chapterNode = findChapter(children, chapterNum);
  const nodesInChapter = removeNodesBeforeNode(children, chapterNode);
  const nextChapterNode = findNextChapter(nodesInChapter, !!chapterNode);
  if ((nextChapterNode && !chapterNode) || !chapterNode) return;

  removeNodeAndAfter(nodesInChapter, chapterNode, nextChapterNode);
  const verseNode = findVerse(nodesInChapter, verseNum);
  if (!verseNode || verseNode.isSelected()) return;

  verseNode.selectNext(0, 0);
}

function findAndSetChapterAndVerse(
  bookNum: number,
  chapterNum: number,
  verseNum: number,
  setScrRef: React.Dispatch<React.SetStateAction<ScriptureReference>>,
): boolean {
  const startNode = $getSelection()?.getNodes()[0];
  if (!startNode) return false;

  const chapterNode = findThisChapter(startNode);
  const verseNode = findThisVerse(startNode);
  hasSelectionChanged = !!(
    (chapterNode && +chapterNode.getNumber() !== chapterNum) ||
    (verseNode && +verseNode.getNumber() !== verseNum)
  );
  if (hasSelectionChanged)
    setScrRef({
      bookNum,
      chapterNum: +(chapterNode?.getNumber() ?? chapterNum),
      verseNum: +(verseNode?.getNumber() ?? verseNum),
    });

  return false;
}
