import { useRef } from "react";

//WIP
export function UsfmForm({ onLoad }: { onLoad: (usfm: string) => void }) {
  const usfmRef = useRef(null);
  const onSubmit = (usfmUrl: string) => {
    fetch(usfmUrl).then(async (usfm) => {
      const usfmContet = await usfm.text();
      onLoad(usfmContet);
    });
  };
  return (
    <>
      <input type="text" id="usfm-url" ref={usfmRef} />
      <button onClick={() => onSubmit(usfmRef?.current?.value)}>load</button>
    </>
  );
}
