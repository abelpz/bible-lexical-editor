/**
 * Converted to typescript from the Lexical React example.
 * @see https://codesandbox.io/s/lexical-rich-text-example-5tncvy
 */
import { JSX } from "react";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { Usj } from "shared/converters/usj/usj.model";
import scriptureUsjNodes from "shared/nodes/scripture/usj";
import { NoteNode } from "./nodes/NoteNode";
import editorTheme from "./themes/editor-theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
// import TreeViewPlugin from './plugins/TreeViewPlugin';
import UpdateStatePlugin from "./plugins/UpdateStatePlugin";
import { LoggerBasic } from "./plugins/logger-basic.model";

type EditorProps<TLogger extends LoggerBasic> = {
  usj?: Usj;
  logger?: TLogger;
};

const editorConfig: InitialConfigType = {
  namespace: "platformEditor",
  theme: editorTheme,
  // Avoid the onChange handler being triggered initially.
  editorState: null,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [NoteNode, ...scriptureUsjNodes],
};

function Placeholder(): JSX.Element {
  return <div className="editor-placeholder">Enter some Scripture...</div>;
}

export default function Editor<TLogger extends LoggerBasic>({
  usj,
  logger,
}: EditorProps<TLogger>): JSX.Element {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <UpdateStatePlugin usj={usj} logger={logger} />
        </div>
      </div>
    </LexicalComposer>
  );
}
