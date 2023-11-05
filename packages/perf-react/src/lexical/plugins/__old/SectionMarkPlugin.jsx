/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  SectionMarkNode,
  TOGGLE_SECTIONMARK_COMMAND,
  toggleSectionMark,
} from "../nodes/SectionMarkNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";

function createDataFromNumber(number) {}

export function SectionMarkPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([SectionMarkNode])) {
      throw new Error("SectionMarkPlugin: SectionMarkNode not registered on editor");
    }
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_SECTIONMARK_COMMAND,
        (payload) => {
          if (payload === null) {
            toggleSectionMark(payload);
            return true;
          } else {
            toggleSectionMark(payload);
            return true;
          }
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (
            !$isRangeSelection(selection) ||
            selection.isCollapsed() ||
            !(event instanceof ClipboardEvent) ||
            event.clipboardData == null
          ) {
            return false;
          }
          const clipboardText = event.clipboardData.getData("text");
          // If we select nodes that are elements then avoid applying the sectionmark.
          if (!selection.getNodes().some((node) => $isElementNode(node))) {
            editor.dispatchCommand(TOGGLE_SECTIONMARK_COMMAND, clipboardText);
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);
  return null;
}

export default function PerfSectionMarkPlugin() {
  return <SectionMarkPlugin />;
}
