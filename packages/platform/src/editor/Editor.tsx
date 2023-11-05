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
import editorTheme from "./themes/editor-theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
// import TreeViewPlugin from './plugins/TreeViewPlugin';
import UpdateStatePlugin from "./plugins/UpdateStatePlugin";
import scriptureUsjNodes from "./nodes/scripture/usj";
import { Usj } from "./converters/usj.model";
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
  nodes: [...scriptureUsjNodes],
};

function Placeholder(): JSX.Element {
  return <div className="editor-placeholder">Enter some rich text...</div>;
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
