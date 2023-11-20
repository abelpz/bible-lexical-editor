/**
 * Convert Scripture from USX to USJ.
 * Adapted to TypeScript from this file:
 * @see https://github.com/mvh-solutions/nice-usfm-json/blob/main/javascript/lib/usx-to-usj.js
 */

import { DOMParser } from "@xmldom/xmldom";
import { MarkerObject, USJ_TYPE, USJ_VERSION, Usj } from "./usj.model";
import { SerializedUsjType, serializeUsjType } from "./usj.util";

type Action = "append" | "merge" | "ignore";
type Attribs = { [name: string]: string };

const USX_TYPE = "usx";

function usxDomToJsonRecurse<T extends Usj | MarkerObject = Usj>(
  inputUsxElement: HTMLElement,
): [outputJson: T, action: Action] {
  let type: string = inputUsxElement.tagName;
  let text: string | undefined;
  let action: Action = "append";
  const attribs: Attribs = {};
  if (inputUsxElement.attributes) {
    for (let i = 0; i < inputUsxElement.attributes.length; i++) {
      const attrib = inputUsxElement.attributes[i];
      attribs[attrib.name] = attrib.value;
    }
  }

  if (attribs.style) {
    type = serializeUsjType(type, attribs.style);
    delete attribs.style;
  }

  let outObj: MarkerObject | MarkerObject[] = { type };
  outObj = { ...outObj, ...attribs };

  if (
    inputUsxElement.firstChild &&
    inputUsxElement.firstChild.nodeType === 3 &&
    inputUsxElement.firstChild.nodeValue &&
    inputUsxElement.firstChild.nodeValue.trim() !== ""
  ) {
    text = inputUsxElement.firstChild.nodeValue;
  }

  const children = Array.from(inputUsxElement.childNodes);
  outObj.content = [];

  if (text) {
    outObj.content.push(text);
  }

  for (const child of children) {
    // ChildNodes are Elements.
    if ((child as HTMLElement).tagName === undefined) {
      continue;
    }
    // ChildNodes are Elements.
    const [childDict, whatToDo] = usxDomToJsonRecurse<MarkerObject>(child as HTMLElement);

    switch (whatToDo) {
      case "append":
        outObj.content.push(childDict);
        break;
      case "merge":
        outObj.content = outObj.content.concat(childDict);
        break;
      case "ignore":
        break;
      default:
        break;
    }

    if (
      child.nextSibling &&
      child.nextSibling.nodeType === 3 &&
      child.nextSibling.nodeValue &&
      (child.nextSibling.nodeValue.trim() !== "" || child.nextSibling.nodeValue === " ")
    ) {
      outObj.content.push(child.nextSibling.nodeValue);
    }
  }

  if (outObj.content.length === 0 && outObj.type !== USX_TYPE) {
    delete outObj.content;
  }

  if ("eid" in outObj && ["verse", "chapter"].includes(inputUsxElement.tagName)) {
    action = "ignore";
  }

  if (
    [serializeUsjType("chapter", "c"), serializeUsjType("verse", "v")].includes(
      type as SerializedUsjType,
    )
  ) {
    if ("altnumber" in outObj) {
      outObj = [outObj];
      outObj.push({
        type: `char:${type.slice(-1)}a`,
        // The check above confirms `altnumber` exists.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        content: [outObj[0].altnumber!],
      });
      delete outObj[0].altnumber;
      action = "merge";
    }

    if ("pubnumber" in outObj) {
      if (!Array.isArray(outObj)) {
        outObj = [outObj];
      }
      outObj.push({
        type: `para:${type.slice(-1)}p`,
        content: [outObj[0].pubnumber],
      });
      delete outObj[0].pubnumber;
      action = "merge";
    }
  }

  // Assert return type since MarkerObject[] are only in the content property.
  return [outObj as T, action];
}

export function usxDomToJson(inputUsxDom: HTMLElement): Usj {
  const [outputJson] = usxDomToJsonRecurse(inputUsxDom);
  outputJson.type = USJ_TYPE;
  outputJson.version = USJ_VERSION;
  return outputJson;
}

export function usxStringToJson(usxString: string): Usj {
  const parser = new DOMParser();
  const inputUsxDom = parser.parseFromString(usxString, "text/xml");
  return usxDomToJson(inputUsxDom.documentElement);
}
