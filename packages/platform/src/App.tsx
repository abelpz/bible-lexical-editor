import { usxStringToJson } from "shared/converters/usj/usx-to-usj";
import { WEB_PSA_USX } from "shared/data/WEB-PSA.usx";
import Editor from "./editor/Editor";
import "./App.css";

const usj = usxStringToJson(WEB_PSA_USX);

export default function App() {
  return <Editor usj={usj} logger={console} />;
}
