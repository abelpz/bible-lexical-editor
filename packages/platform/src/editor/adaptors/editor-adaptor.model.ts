import { SerializedEditorState } from "lexical";

export interface EditorAdaptor {
  /**
   * Load the Scripture into a serialized editor state.
   * @param scripture - Scripture to adapt to the editor.
   * @returns the serialized editor state.
   */
  loadEditorState(scripture: unknown | undefined): SerializedEditorState;

  /**
   * Initialize the adaptor.
   * @param args - Arguments to initialize.
   */
  initialize?(...args: unknown[]): void;

  /**
   * Reset the adaptor to use with new/changed Scripture.
   * @param resetValues - Values to reset to.
   */
  reset?(...resetValues: unknown[]): void;
}
