import { ElementNode } from "lexical";

export class UsfmElementNode extends ElementNode {
  constructor(attributes, data, tag, key) {
    super(key);
    this.__data = data;
    this.__attributes = attributes;
    this.__tag = tag;
  }

  getData() {
    return this.getLatest().__data;
  }

  setData(data) {
    const writable = this.getWritable();
    writable.__data = data;
  }

  getAttributes() {
    return this.getLatest().__attributes;
  }

  setAttributes(attributes) {
    const writable = this.getWritable();
    writable.__attributes = attributes;
  }

  getTag() {
    return this.getLatest().__tag;
  }

  setTag(tag) {
    const writable = this.getWritable();
    writable.__tag = tag;
  }

  exportJSON() {
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
