import { $applyNodeReplacement, ElementNode } from "lexical";

export class WrapperNode extends ElementNode {
  static getType() {
    return "wrapper";
  }

  static clone(node) {
    return new WrapperNode(node.__key);
  }

  isInline() {
    return true;
  }

  createDOM() {
    // Define the DOM element here
    const dom = document.createElement("span");
    return dom;
  }

  static importJSON(serializedNode) {
    const node = $createWrapperNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  updateDOM() {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "wrapper",
      version: 1,
    };
  }
}

function $createWrapperNode() {
  return $applyNodeReplacement(new WrapperNode());
}
