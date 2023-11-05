/** Conforms with USX v3.0 @see https://ubsicap.github.io/usx/elements.html#chapter */

import {
  type LexicalNode,
  type NodeKey,
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";

export const CHAPTER_STYLE = "c";
export const CHAPTER_VERSION = 1;

type ChapterUsxStyle = typeof CHAPTER_STYLE;

export type SerializedChapterNode = Spread<
  {
    usxStyle: ChapterUsxStyle;
    number: string;
    sid?: string;
    altnumber?: string;
    pubnumber?: string;
  },
  SerializedLexicalNode
>;

export class ImmutableChapterNode extends DecoratorNode<void> {
  __usxStyle: ChapterUsxStyle;
  __number: string;
  __sid?: string;
  __altnumber?: string;
  __pubnumber?: string;

  constructor(
    chapterNumber: string,
    sid?: string,
    altnumber?: string,
    pubnumber?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__usxStyle = CHAPTER_STYLE;
    this.__number = chapterNumber;
    this.__sid = sid;
    this.__altnumber = altnumber;
    this.__pubnumber = pubnumber;
  }

  static getType(): string {
    return "chapter";
  }

  static clone(node: ImmutableChapterNode): ImmutableChapterNode {
    return new ImmutableChapterNode(node.__number, node.__key);
  }

  static importJSON(serializedNode: SerializedChapterNode): ImmutableChapterNode {
    const node = $createImmutableChapterNode(
      serializedNode.number,
      serializedNode.sid,
      serializedNode.altnumber,
      serializedNode.pubnumber,
    );
    node.setUsxStyle(serializedNode.usxStyle);
    return node;
  }

  setUsxStyle(usxStyle: ChapterUsxStyle): void {
    const self = this.getWritable();
    self.__usxStyle = usxStyle;
  }

  getUsxStyle(): ChapterUsxStyle {
    const self = this.getLatest();
    return self.__usxStyle;
  }

  setNumber(chapterNumber: string): void {
    const self = this.getWritable();
    self.__number = chapterNumber;
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

  // TODO: allow editing the chapter number.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  decorate(): void {}

  exportJSON(): SerializedChapterNode {
    return {
      type: this.getType(),
      usxStyle: this.getUsxStyle(),
      number: this.getNumber(),
      sid: this.getSid(),
      altnumber: this.getAltnumber(),
      pubnumber: this.getPubnumber(),
      version: CHAPTER_VERSION,
    };
  }
}

export function $createImmutableChapterNode(
  chapterNumber: string,
  sid?: string,
  altnumber?: string,
  pubnumber?: string,
): ImmutableChapterNode {
  return $applyNodeReplacement(new ImmutableChapterNode(chapterNumber, sid, altnumber, pubnumber));
}

export function $isImmutableChapterNode(
  node: LexicalNode | null | undefined,
): node is ImmutableChapterNode {
  return node instanceof ImmutableChapterNode;
}
