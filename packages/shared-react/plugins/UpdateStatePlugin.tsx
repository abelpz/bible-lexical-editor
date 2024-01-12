import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { useEffect } from "react";
import { LoggerBasic } from "./logger-basic.model";
import { EditorAdaptor, NodeOptions } from "../adaptors/editor-adaptor.model";

/**
 * A plugin component that updates the state of the lexical editor when incoming Scripture changes.
 * @param props.scripture - Scripture data.
 * @param props.nodeOptions - Options for each node.
 * @param props.editorAdaptor - Editor adaptor
 * @param props.logger - logger instance
 * @returns null, i.e. no DOM elements.
 */
export default function UpdateStatePlugin<TLogger extends LoggerBasic>({
  scripture,
  nodeOptions,
  editorAdaptor,
  logger,
}: {
  scripture?: unknown;
  nodeOptions?: NodeOptions;
  editorAdaptor: EditorAdaptor;
  logger?: TLogger;
}): null {
  const [editor] = useLexicalComposerContext();
  editorAdaptor.initialize?.(nodeOptions, logger);

  useEffect(() => {
    editorAdaptor.reset?.();
    const serializedEditorState = editorAdaptor.loadEditorState(scripture);
    const editorState = editor.parseEditorState(serializedEditorState);
    // Execute at a safe time prior to control returning to the browser's event loop.
    queueMicrotask(() => {
      editor.setEditorState(editorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    });
  }, [editor, scripture, logger, editorAdaptor]);

  return null;
}
