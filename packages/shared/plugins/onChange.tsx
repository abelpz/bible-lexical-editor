export const registerOnChange = ({
  editor,
  onChange,
  ignoreHistoryMergeTagChange = true,
  ignoreSelectionChange = true,
}) => {
  if (onChange) {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (
          (ignoreSelectionChange &&
            dirtyElements.size === 0 &&
            dirtyLeaves.size === 0) ||
          (ignoreHistoryMergeTagChange && tags.has("history-merge")) ||
          prevEditorState.isEmpty()
        ) {
          return;
        }

        onChange({ editorState, editor, tags, dirtyElements, dirtyLeaves });
      },
    );
  }
};
