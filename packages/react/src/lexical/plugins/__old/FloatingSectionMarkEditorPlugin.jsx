import "./index.css";
import {
  $isAutoSectionMarkNode,
  $isSectionMarkNode,
  TOGGLE_SECTIONMARK_COMMAND,
} from "../nodes/SectionMarkNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { getSelectedNode, setFloatingElemPositionForSectionMarkEditor } from "../utils";

//TODO: implement sanitization
function sanitizeInput(input) {
  return input;
}

function FloatingSectionMarkEditor({
  editor,
  isSectionMark,
  setIsSectionMark,
  anchorElem,
  isSectionMarkEditMode,
  setIsSectionMarkEditMode,
}) {
  console.log({
    editor,
    isSectionMark,
    setIsSectionMark,
    anchorElem,
    isSectionMarkEditMode,
    setIsSectionMarkEditMode,
  });
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const [sectionMarkData, setSectionMarkData] = useState("");
  const [editedSectionMarkNumber, setEditedSectionMarkNumber] = useState("");
  const [lastSelection, setLastSelection] = useState(null);
  const updateSectionMarkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isSectionMarkNode(parent)) {
        const data = parent.getData();
        console.log({ data, parent });
        setSectionMarkData(data);
      } else if ($isSectionMarkNode(node)) {
        setSectionMarkData(node.getData());
      } else {
        setSectionMarkData({});
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;
    if (editorElem === null) {
      return;
    }
    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect = nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForSectionMarkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "sectionmark-input") {
      if (rootElement !== null) {
        setFloatingElemPositionForSectionMarkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      console.log(1);
      setIsSectionMarkEditMode(false);
      setSectionMarkData({});
    }
    return true;
  }, [anchorElem, editor, setIsSectionMarkEditMode]);
  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;
    const update = () => {
      editor.getEditorState().read(() => {
        updateSectionMarkEditor();
      });
    };
    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }
    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem.parentElement, editor, updateSectionMarkEditor]);
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateSectionMarkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateSectionMarkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isSectionMark) {
            setIsSectionMark(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, updateSectionMarkEditor, setIsSectionMark, isSectionMark]);
  useEffect(() => {
    editor.getEditorState().read(() => {
      updateSectionMarkEditor();
    });
  }, [editor, updateSectionMarkEditor]);
  useEffect(() => {
    if (isSectionMarkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSectionMarkEditMode, isSectionMark]);
  const monitorInputInteraction = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSectionMarkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      console.log(2);
      setIsSectionMarkEditMode(false);
    }
  };
  const handleSectionMarkSubmission = () => {
    if (lastSelection !== null) {
      console.log({ editedSectionMarkNumber, lastSelection });
      if (sectionMarkData !== {}) {
        editor.dispatchCommand(
          TOGGLE_SECTIONMARK_COMMAND,
          sanitizeInput({
            ...sectionMarkData,
            atts: { number: editedSectionMarkNumber },
          }),
        );
      }
      setEditedSectionMarkNumber("");
      console.log(3);
      setIsSectionMarkEditMode(false);
    }
  };
  return (
    <div ref={editorRef} className="sectionmark-editor">
      {!isSectionMark ? null : isSectionMarkEditMode ? (
        <>
          <input
            ref={inputRef}
            className="sectionmark-input"
            value={editedSectionMarkNumber}
            onChange={(event) => {
              setEditedSectionMarkNumber(event.target.value);
            }}
            onKeyDown={(event) => {
              monitorInputInteraction(event);
            }}
          />
          <div>
            <div
              className="sectionmark-cancel"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                console.log(4);
                setIsSectionMarkEditMode(false);
              }}
            >
              cancel
            </div>

            <div
              className="sectionmark-confirm"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleSectionMarkSubmission}
            >
              confirm
            </div>
          </div>
        </>
      ) : (
        <div className="sectionmark-view">
          <a
            href={sanitizeInput(sectionMarkData.atts.number)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {sectionMarkData.atts.number}
          </a>
          <div
            className="sectionmark-edit"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditedSectionMarkNumber(sectionMarkData.atts.number);
              console.log(5);
              setIsSectionMarkEditMode(true);
            }}
          >
            edit
          </div>
          <div
            className="sectionmark-trash"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              editor.dispatchCommand(TOGGLE_SECTIONMARK_COMMAND, null);
            }}
          >
            delete
          </div>
        </div>
      )}
    </div>
  );
}
function useFloatingSectionMarkEditorToolbar(
  editor,
  anchorElem,
  isSectionMarkEditMode,
  setIsSectionMarkEditMode,
) {
  console.log({ anchorElem });
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isSectionMark, setIsSectionMark] = useState(false);
  useEffect(() => {
    function updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection);
        const sectionmarkParent = $findMatchingParent(node, $isSectionMarkNode);
        const autoSectionMarkParent = $findMatchingParent(node, $isAutoSectionMarkNode);
        // We don't want this menu to open for auto sectionmarks.
        if (sectionmarkParent !== null && autoSectionMarkParent === null) {
          setIsSectionMark(true);
        } else {
          setIsSectionMark(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const sectionmarkNode = $findMatchingParent(node, $isSectionMarkNode);
            if ($isSectionMarkNode(sectionmarkNode) && (payload.metaKey || payload.ctrlKey)) {
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);
  return createPortal(
    <FloatingSectionMarkEditor
      editor={activeEditor}
      isSectionMark={isSectionMark}
      anchorElem={anchorElem}
      setIsSectionMark={setIsSectionMark}
      isSectionMarkEditMode={isSectionMarkEditMode}
      setIsSectionMarkEditMode={setIsSectionMarkEditMode}
    />,
    anchorElem,
  );
}
export default function FloatingSectionMarkEditorPlugin({
  anchorElem = document.body,
  isSectionMarkEditMode,
  setIsSectionMarkEditMode,
}) {
  const [editor] = useLexicalComposerContext();
  return useFloatingSectionMarkEditorToolbar(
    editor,
    anchorElem,
    isSectionMarkEditMode,
    setIsSectionMarkEditMode,
  );
}
