import {
  NOTE_INDEX,
  NOTE_PARA_INDEX,
  editorStateEmpty,
  editorStateGen1v1,
  editorStateGen1v1ImpliedPara,
  usjEmpty,
  usjGen1v1,
  usjGen1v1ImpliedPara,
} from "shared/converters/usj/converter-test.data";
import { MarkerObject } from "shared/converters/usj/usj.model";
import { SerializedParaNode } from "shared/nodes/scripture/usj/ParaNode";
import { SerializedNoteNode } from "../nodes/NoteNode";
import { loadEditorState, resetCallerCount } from "./UpdateStatePlugin";

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

  it("should convert from USJ to Lexical editor state JSON with caller clocked", () => {
    resetCallerCount(25);

    // SUT
    let serializedEditorState = loadEditorState(usjGen1v1);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    note.caller = "z";
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);

    resetCallerCount(52);

    // SUT
    serializedEditorState = loadEditorState(usjGen1v1);

    note.caller = "ba";
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should reset if the note caller count is too large", () => {
    resetCallerCount(701);

    // SUT
    let serializedEditorState = loadEditorState(usjGen1v1);

    const editorStateCallerUpdated = editorStateGen1v1;
    const note = (editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode)
      .children[NOTE_INDEX] as SerializedNoteNode;
    note.caller = "zz";
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);

    resetCallerCount(702);

    // SUT
    serializedEditorState = loadEditorState(usjGen1v1);

    note.caller = "a";
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });

  it("should convert from USJ to Lexical editor state JSON without note", () => {
    const usjGen1v1Updated = usjGen1v1;
    const usjNote = (
      (usjGen1v1Updated.content[NOTE_PARA_INDEX] as MarkerObject).content as MarkerObject[]
    )[NOTE_INDEX];
    usjNote.caller = "-";

    const serializedEditorState = loadEditorState(usjGen1v1Updated);

    const editorStateCallerUpdated = editorStateGen1v1;
    const notePara = editorStateCallerUpdated.root.children[NOTE_PARA_INDEX] as SerializedParaNode;
    notePara.children.splice(NOTE_INDEX, 1);
    expect(serializedEditorState).toEqual(editorStateCallerUpdated);
  });
});
