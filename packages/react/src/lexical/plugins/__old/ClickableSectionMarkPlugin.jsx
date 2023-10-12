/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isSectionMarkNode } from "../nodes/SectionMarkNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  getNearestEditorFromDOMNode,
  isHTMLElement,
} from "lexical";
import { useEffect } from "react";

export function isHTMLSectionMarkElement(x) {
  const { type, subtype, atts_number } = x.dataset || {};
  return (
    isHTMLElement(x) &&
    type === "mark" &&
    (subtype === "verses" || subtype === "chapter") &&
    atts_number
  );
}

function findMatchingDOM(startNode, predicate) {
  let node = startNode;
  while (node != null) {
    if (predicate(node)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}
export default function PerfClickableSectionMarkPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const nearestEditor = getNearestEditorFromDOMNode(target);
      if (nearestEditor === null) {
        return;
      }
      let data = null;
      nearestEditor.update(() => {
        const clickedNode = $getNearestNodeFromDOMNode(target);
        if (clickedNode !== null) {
          const maybeSectionMarkNode = $findMatchingParent(
            clickedNode,
            $isElementNode,
          );
          if ($isSectionMarkNode(maybeSectionMarkNode)) {
            data = maybeSectionMarkNode.getData();
          } else {
            const element = findMatchingDOM(target, isHTMLSectionMarkElement);
            if (element !== null) {
              data = {
                type: element.dataset["type"],
                subtype: element.dataset["subtype"],
                atts: { number: element.dataset["atts_number"] },
              };
            }
          }
        }
      });
      if (data?.atts?.number === null || data?.atts?.number === "") {
        return;
      }
      // Allow user to select sectionmark text without follwing url
      const selection = editor.getEditorState().read($getSelection);
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
    };
    const onMouseUp = (event) => {
      if (event.button === 1 && editor.isEditable()) {
        onClick(event);
      }
    };
    return editor.registerRootListener((rootElement, prevRootElement) => {
      if (prevRootElement !== null) {
        prevRootElement.removeEventListener("click", onClick);
        prevRootElement.removeEventListener("mouseup", onMouseUp);
      }
      if (rootElement !== null) {
        rootElement.addEventListener("click", onClick);
        rootElement.addEventListener("mouseup", onMouseUp);
      }
    });
  }, [editor]);
  return null;
}
