/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  $createAutoSectionMarkNode,
  $isAutoSectionMarkNode,
  $isSectionMarkNode,
  AutoSectionMarkNode,
} from "../nodes/SectionMarkNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $createTextNode, $isElementNode, $isLineBreakNode, $isTextNode, TextNode } from "lexical";
import { useEffect } from "react";
import invariant from "lexical";
import * as React from "react";

export function createSectionMarkMatcherWithRegExp(regExp, markTransformer = (text) => text) {
  return (text) => {
    const match = regExp.exec(text);
    if (match === null) return null;
    return {
      index: match.index,
      length: match[0].length,
      text: match[0],
      number: markTransformer(text),
    };
  };
}

function createDataFromMatch(match) {
  return {
    type: "mark",
    subtype: match.text[1] === "v" ? "verse" : "chapter",
    atts: { number: match.number.slice(3) },
  };
}

function findFirstMatch(text, matchers) {
  for (let i = 0; i < matchers.length; i++) {
    const match = matchers[i](text);
    if (match) {
      return match;
    }
  }
  return null;
}
const PUNCTUATION_OR_SPACE = /[.,;\s]/;
function isSeparator(char) {
  return PUNCTUATION_OR_SPACE.test(char);
}
function endsWithSeparator(textContent) {
  return isSeparator(textContent[textContent.length - 1]);
}
function startsWithSeparator(textContent) {
  return isSeparator(textContent[0]);
}
function isPreviousNodeValid(node) {
  let previousNode = node.getPreviousSibling();
  if ($isElementNode(previousNode)) {
    previousNode = previousNode.getLastDescendant();
  }
  return (
    previousNode === null ||
    $isLineBreakNode(previousNode) ||
    ($isTextNode(previousNode) && endsWithSeparator(previousNode.getTextContent()))
  );
}
function isNextNodeValid(node) {
  let nextNode = node.getNextSibling();
  if ($isElementNode(nextNode)) {
    nextNode = nextNode.getFirstDescendant();
  }
  return (
    nextNode === null ||
    $isLineBreakNode(nextNode) ||
    ($isTextNode(nextNode) && startsWithSeparator(nextNode.getTextContent()))
  );
}
function isContentAroundIsValid(matchStart, matchEnd, text, node) {
  const contentBeforeIsValid =
    matchStart > 0 ? isSeparator(text[matchStart - 1]) : isPreviousNodeValid(node);
  if (!contentBeforeIsValid) {
    return false;
  }
  const contentAfterIsValid =
    matchEnd < text.length ? isSeparator(text[matchEnd]) : isNextNodeValid(node);
  return contentAfterIsValid;
}
function handleSectionMarkCreation(node, matchers, onChange) {
  const nodeText = node.getTextContent();
  let text = nodeText;
  let invalidMatchEnd = 0;
  let remainingTextNode = node;
  let match;
  while ((match = findFirstMatch(text, matchers)) && match !== null) {
    const matchStart = match.index;
    const matchLength = match.length;
    const matchEnd = matchStart + matchLength;
    const isValid = isContentAroundIsValid(
      invalidMatchEnd + matchStart,
      invalidMatchEnd + matchEnd,
      nodeText,
      node,
    );
    if (isValid) {
      let sectionmarkTextNode;
      if (invalidMatchEnd + matchStart === 0) {
        [sectionmarkTextNode, remainingTextNode] = remainingTextNode.splitText(
          invalidMatchEnd + matchLength,
        );
      } else {
        [, sectionmarkTextNode, remainingTextNode] = remainingTextNode.splitText(
          invalidMatchEnd + matchStart,
          invalidMatchEnd + matchStart + matchLength,
        );
      }
      const sectionmarkNode = $createAutoSectionMarkNode(createDataFromMatch(match));
      const textNode = $createTextNode(match.text.slice(3));
      textNode.setFormat(sectionmarkTextNode.getFormat());
      textNode.setDetail(sectionmarkTextNode.getDetail());
      sectionmarkNode.append(textNode);
      sectionmarkTextNode.replace(sectionmarkNode);
      onChange(createDataFromMatch(match), null);
      invalidMatchEnd = 0;
    } else {
      invalidMatchEnd += matchEnd;
    }
    text = text.substring(matchEnd);
  }
}
function handleSectionMarkEdit(sectionmarkNode, matchers, onChange) {
  // Check children are simple text
  const children = sectionmarkNode.getChildren();
  const childrenLength = children.length;
  for (let i = 0; i < childrenLength; i++) {
    const child = children[i];
    if (!$isTextNode(child) || !child.isSimpleText()) {
      replaceWithChildren(sectionmarkNode);
      onChange(null, sectionmarkNode.getData());
      return;
    }
  }
  // Check text content fully matches
  const text = sectionmarkNode.getTextContent();
  const match = findFirstMatch(text, matchers);
  if (match === null || match.text !== text) {
    replaceWithChildren(sectionmarkNode);
    onChange(null, sectionmarkNode.getData());
    return;
  }
  // Check neighbors
  if (!isPreviousNodeValid(sectionmarkNode) || !isNextNodeValid(sectionmarkNode)) {
    replaceWithChildren(sectionmarkNode);
    onChange(null, sectionmarkNode.getData());
    return;
  }
  const data = sectionmarkNode.getData();
  const matchData = createDataFromMatch(match);
  if (data !== matchData) {
    sectionmarkNode.setData(matchData);
    onChange(matchData, data);
  }
}
// Bad neighbours are edits in neighbor nodes that make AutoSectionMarks incompatible.
// Given the creation preconditions, these can only be simple text nodes.
function handleBadNeighbors(textNode, matchers, onChange) {
  const previousSibling = textNode.getPreviousSibling();
  const nextSibling = textNode.getNextSibling();
  const text = textNode.getTextContent();
  if ($isAutoSectionMarkNode(previousSibling) && !startsWithSeparator(text)) {
    previousSibling.append(textNode);
    handleSectionMarkEdit(previousSibling, matchers, onChange);
    onChange(null, previousSibling.getData());
  }
  if ($isAutoSectionMarkNode(nextSibling) && !endsWithSeparator(text)) {
    replaceWithChildren(nextSibling);
    handleSectionMarkEdit(nextSibling, matchers, onChange);
    onChange(null, nextSibling.getData());
  }
}
function replaceWithChildren(node) {
  const children = node.getChildren();
  const childrenLength = children.length;
  for (let j = childrenLength - 1; j >= 0; j--) {
    node.insertAfter(children[j]);
  }
  node.remove();
  return children.map((child) => child.getLatest());
}
function useAutoSectionMark(editor, matchers, onChange) {
  useEffect(() => {
    if (!editor.hasNodes([AutoSectionMarkNode])) {
      invariant(
        false,
        "LexicalAutoSectionMarkPlugin: AutoSectionMarkNode not registered on editor",
      );
    }
    const onChangeWrapped = (data, prevData) => {
      if (onChange) {
        onChange(data, prevData);
      }
    };
    return mergeRegister(
      editor.registerNodeTransform(TextNode, (textNode) => {
        const parent = textNode.getParentOrThrow();
        const previous = textNode.getPreviousSibling();
        if ($isAutoSectionMarkNode(parent)) {
          handleSectionMarkEdit(parent, matchers, onChangeWrapped);
        } else if (!$isSectionMarkNode(parent)) {
          if (
            textNode.isSimpleText() &&
            (startsWithSeparator(textNode.getTextContent()) || !$isAutoSectionMarkNode(previous))
          ) {
            handleSectionMarkCreation(textNode, matchers, onChangeWrapped);
          }
          handleBadNeighbors(textNode, matchers, onChangeWrapped);
        }
      }),
    );
  }, [editor, matchers, onChange]);
}
export function AutoSectionMarkPlugin({ matchers, onChange }) {
  const [editor] = useLexicalComposerContext();
  useAutoSectionMark(editor, matchers, onChange);
  return null;
}

const MARK_REGEX = /\\[cv] \d+(?:-\d+)?/;
const MATCHERS = [createSectionMarkMatcherWithRegExp(MARK_REGEX)];
export default function PerfAutoSectionMarkPlugin() {
  return React.createElement(AutoSectionMarkPlugin, { matchers: MATCHERS });
}
