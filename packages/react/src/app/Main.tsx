import * as React from "react";
import { UsfmForm } from "./UsfmForm";

export function Main() {
  return (
    <>
      <UsfmForm onLoad={onLoad} />
    </>
  );
}
