import Editor from "./editor/Editor";
import { usxStringToJson } from "./editor/converters/usx-to-usj";
import { WEB_PSA_USX } from "shared/data/WEB-PSA.usx";
import "./App.css";

const usj = usxStringToJson(WEB_PSA_USX);

function App() {
  return <Editor usj={usj} logger={console} />;
}

export default App;
