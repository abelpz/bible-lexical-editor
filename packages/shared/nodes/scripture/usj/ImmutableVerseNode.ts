/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#verse */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";

export const VERSE_STYLE = "v";
export const VERSE_VERSION = 1;

type VerseUsxStyle = typeof VERSE_STYLE;

export type SerializedVerseNode = Spread<
  {
    usxStyle: VerseUsxStyle;
    number: string;
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
  },
  SerializedLexicalNode
>;

export class ImmutableVerseNode extends DecoratorNode<void> {
  __usxStyle: VerseUsxStyle;
  __number: string;
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;

  constructor(
    verseNumber: string,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__usxStyle = VERSE_STYLE;
    this.__number = verseNumber;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
  }

  static getType(): string {
    return "verse";
  }

  static clone(node: ImmutableVerseNode): ImmutableVerseNode {
    return new ImmutableVerseNode(node.__number, node.__key);
  }

  static importJSON(serializedNode: SerializedVerseNode): ImmutableVerseNode {
    const node = $createImmutableVerseNode(
      serializedNode.number,
      serializedNode.sid,
      serializedNode.altnumber,
      serializedNode.pubnumber,
    );
    node.setUsxStyle(serializedNode.usxStyle);
    return node;
  }

  setUsxStyle(usxStyle: VerseUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): VerseUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setNumber(verseNumber: string): void {
    const self = this.getWritable();
    self.__number = verseNumber;
  }

  getNumber(): string {
    const self = this.getLatest();
    return self.__number;
  }

  setSid(sid: string | undefined): void {
    const self = this.getWritable();
    self.__sid = sid;
  }

  getSid(): string | undefined {
    const self = this.getLatest();
    return self.__sid;
  }

  setAltnumber(altnumber: string | undefined): void {
    const self = this.getWritable();
    self.__altnumber = altnumber;
  }

  getAltnumber(): string | undefined {
    const self = this.getLatest();
    return self.__altnumber;
  }

  setPubnumber(pubnumber: string | undefined): void {
    const self = this.getWritable();
    self.__pubnumber = pubnumber;
  }

  getPubnumber(): string | undefined {
    const self = this.getLatest();
    return self.__pubnumber;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.setAttribute("data-usx-style", this.__usxStyle);
    dom.classList.add(this.getType(), `usfm_${this.__usxStyle}`);
    dom.setAttribute("data-number", this.__number);
    return dom;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  decorate(): string {
    return this.getNumber();
  }

  exportJSON(): SerializedVerseNode {
    return {
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      number: this.getNumber(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      version: VERSE_VERSION,
    };
  }
}

export function $createImmutableVerseNode(
  verseNumber: string,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
): ImmutableVerseNode {
  return $applyNodeReplacement(new ImmutableVerseNode(verseNumber, sid, altnumber, pubnumber));
}

export function $isImmutableVerseNode(
  node: LexicalNode | null | undefined,
): node is ImmutableVerseNode {
  return node instanceof ImmutableVerseNode;
}
