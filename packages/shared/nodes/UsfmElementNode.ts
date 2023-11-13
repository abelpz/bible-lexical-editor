import { ElementNode, NodeKey, SerializedElementNode, Spread } from "lexical";

export type Attributes = { [key: string]: string };

export type SerializedUsfmElementNode = Spread<
  {
    attributes: Attributes;
    data: unknown;
    tag: string;
  },
  SerializedElementNode
>;

export class UsfmElementNode extends ElementNode {
  constructor(attributes: Attributes, data: unknown, tag: string | undefined, key?: NodeKey) {
    super(key);
    this.__data = data;
    this.__attributes = attributes;
    this.__tag = tag;
  }

  getData(): unknown {
    return this.getLatest().__data;
  }

  setData(data: unknown) {
    const writable = this.getWritable();
    writable.__data = data;
  }

  getAttributes(): Attributes {
    return this.getLatest().__attributes;
  }

  setAttributes(attributes: Attributes) {
    const writable = this.getWritable();
    writable.__attributes = attributes;
  }

  getTag(): string {
    return this.getLatest().__tag;
  }

  setTag(tag: string) {
    const writable = this.getWritable();
    writable.__tag = tag;
  }

  exportJSON(): SerializedUsfmElementNode {
    return {
      ...super.exportJSON(),
      data: this.getData(),
      attributes: this.getAttributes(),
      tag: this.getTag(),
      type: "usfmelement",
      version: 1,
    };
  }
}
