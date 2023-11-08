import {
  editorStateEmpty,
  editorStateGen1v1,
  editorStateGen1v1ImpliedPara,
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
} from "shared/converters/usj/converter-test.data";
import { loadEditorState } from "./UpdateStatePlugin";

describe("Update Lexical State", () => {
  it("should convert from empty USJ to Lexical editor state JSON", () => {
    const serializedEditorState = loadEditorState(usjEmpty);
    expect(serializedEditorState).toEqual(editorStateEmpty);
  });

  it("should convert from USJ to Lexical editor state JSON", () => {
    const serializedEditorState = loadEditorState(usjGen1v1);
    expect(serializedEditorState).toEqual(editorStateGen1v1);
  });

  it("should convert from USJ with implied para to Lexical editor state JSON", () => {
    const serializedEditorState = loadEditorState(usjGen1v1ImpliedPara);
    expect(serializedEditorState).toEqual(editorStateGen1v1ImpliedPara);
  });
});
