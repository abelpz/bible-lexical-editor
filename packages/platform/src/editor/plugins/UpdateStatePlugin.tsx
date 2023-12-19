import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { useEffect } from "react";
import { LoggerBasic } from "./logger-basic.model";
import { EditorAdaptor } from "../adaptors/editor-adaptor.model";

/**
 * A component (plugin) that updates the state of lexical when incoming Scripture changes.
 * @param props.scripture - Scripture data.
 * @param props.noteCallers - Possible note callers to use when caller is '+'.
 * @param props.editorAdaptor - Editor adaptor
 * @param props.logger - logger instance
 * @returns null, i.e. no DOM elements.
 */
export default function UpdateStatePlugin<TLogger extends LoggerBasic>({
  scripture,
  noteCallers,
  editorAdaptor,
  logger,
}: {
  scripture?: unknown;
  noteCallers?: string[];
  editorAdaptor: EditorAdaptor;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  editorAdaptor.initialize?.(noteCallers, logger);

  useEffect(() => {
    editorAdaptor.reset?.();
    const serializedEditorState = editorAdaptor.loadEditorState(scripture);
    const editorState = editor.parseEditorState(serializedEditorState);
    // TODO: review use of `queueMicrotask`. It stops an error but why is it necessary?
    queueMicrotask(() => {
      editor.setEditorState(editorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    });
  }, [editor, scripture, logger, editorAdaptor]);

  return null;
}
