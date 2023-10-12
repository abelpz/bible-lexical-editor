import { addClassNamesToElement, isHTMLAnchorElement } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  createCommand,
  ElementNode,
} from "lexical";

/** @noInheritDoc */
export class SectionMarkNode extends ElementNode {
  static getType() {
    return "sectionmark";
  }
  static clone(node) {
    return new SectionMarkNode(node.__data, node.__key);
  }
  constructor(data, key) {
    super(key);
    this.__data = data;
  }

  createDOM(config) {
    const element = document.createElement("a");
    element.setAttribute("href", "#");
    const data = this.__data;
    Object.keys(data).forEach((key) => {
      if (key === "metaContent") return;
      if (key === "atts") {
        Object.keys(data[key]).forEach((att) => {
          element.dataset[`${key}_${att}`] = data[key][att];
        });
      } else element.dataset[key] = data[key];
    });
    element.className = `${data.type} ${data.subtype}`;
    addClassNamesToElement(element, config.theme.sectionmark);
    return element;
  }

  updateDOM(prevNode, anchor, config) {
    const data = this.data;
    if (data !== prevNode.__data) {
      anchor.data = data;
    }
    return false;
  }

  static importDOM() {
    return {
      a: (node) => ({
        conversion: convertAnchorElement(node),
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode) {
    const data = serializedNode.data;
    const node = $createSectionMarkNode(data);
    node.setData(data);
    return node;
  }
  sanitizeData(data) {
    // try {
    //   const parsedData = new DATA(data);
    //   // eslint-disable-next-line no-script-data
    //   if (!SUPPORTED_DATA_PROTOCOLS.has(parsedData.protocol)) {
    //     return "about:blank";
    //   }
    // } catch (_a) {
    //   return data;
    // }
    return data;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      data: this.getData(),
      type: "sectionmark",
      version: 1,
    };
  }
  getData() {
    const node = this.getLatest();
    console.log("GETTING DATA", { node });
    return node.__data;
  }
  setData(data) {
    const writable = this.getWritable();
    writable.__data = data;
  }

  insertNewAfter(selection, restoreSelection = true) {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection,
    );
    if ($isElementNode(element)) {
      const sectionmarkNode = $createSectionMarkNode(this.__data);
      element.append(sectionmarkNode);
      return sectionmarkNode;
    }
    return null;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
  canBeEmpty() {
    return false;
  }
  isInline() {
    return true;
  }
  extractWithChild(child, selection, destination) {
    if (!$isRangeSelection(selection)) {
      return false;
    }
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    );
  }
}
function convertAnchorElement(domNode) {
  let node = null;
  if (isHTMLAnchorElement(domNode)) {
    const data = domNode.dataset;
    if (
      data.type === "mark" &&
      (data.subtype === "chapter" || data.subtype === "verses")
    ) {
      node = $createSectionMarkNode({
        atts: { number: domNode.getAttribute("data-atts_number") },
        type: domNode.getAttribute("data-type"),
        subtype: domNode.getAttribute("data-subtype"),
      });
    }
  }
  return { node };
}
/**
 * Takes a DATA and creates a SectionMarkNode.
 * @param data - The DATA the SectionMarkNode should direct to.
 * @param attributes - Optional HTML a tag attributes { target, rel, title }
 * @returns The SectionMarkNode.
 */
export function $createSectionMarkNode(data) {
  return $applyNodeReplacement(new SectionMarkNode(data));
}
/**
 * Determines if node is a SectionMarkNode.
 * @param node - The node to be checked.
 * @returns true if node is a SectionMarkNode, false otherwise.
 */
export function $isSectionMarkNode(node) {
  return node instanceof SectionMarkNode;
}
// Custom node type to override `canInsertTextAfter` that will
// allow typing within the sectionmark
export class AutoSectionMarkNode extends SectionMarkNode {
  static getType() {
    return "autosectionmark";
  }
  static clone(node) {
    return new AutoSectionMarkNode(node.__data, node.__key);
  }
  static importJSON(serializedNode) {
    const node = $createAutoSectionMarkNode(serializedNode.data);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
  static importDOM() {
    return null;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "autosectionmark",
      version: 1,
    };
  }
  insertNewAfter(selection, restoreSelection = true) {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection,
    );
    if ($isElementNode(element)) {
      const sectionmarkNode = $createAutoSectionMarkNode(this.__data);
      element.append(sectionmarkNode);
      return sectionmarkNode;
    }
    return null;
  }
}
/**
 * Takes a DATA and creates an AutoSectionMarkNode. AutoSectionMarkNodes are generally automatically generated
 * during typing, which is especially useful when a button to generate a SectionMarkNode is not practical.
 * @param {Object} data - The DATA the SectionMarkNode should contain coming from PERF.
 * @param {string} data.type - the type of element "mark"
 * @param {string} data.subtype - the subtype "chapter or verse"
 * @param {Object} data.atts
 * @param {Object} data.atts.number - the verse or chapter number
 * @returns The SectionMarkNode.
 */
export function $createAutoSectionMarkNode(data) {
  return $applyNodeReplacement(new AutoSectionMarkNode(data));
}
/**
 * Determines if node is an AutoSectionMarkNode.
 * @param node - The node to be checked.
 * @returns true if node is an AutoSectionMarkNode, false otherwise.
 */
export function $isAutoSectionMarkNode(node) {
  return node instanceof AutoSectionMarkNode;
}
export const TOGGLE_SECTIONMARK_COMMAND = createCommand(
  "TOGGLE_SECTIONMARK_COMMAND",
);
/**
 * Generates or updates a SectionMarkNode. It can also delete a SectionMarkNode if the DATA is null,
 * but saves any children and brings them up to the parent node.
 * @param data - The DATA the sectionmark directs to.
 * @param attributes - Optional HTML a tag attributes. { target, rel, title }
 */
export function toggleSectionMark(data) {
  console.log({ data });
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();
  if (data === null) {
    // Remove SectionMarkNodes
    nodes.forEach((node) => {
      const parent = node.getParent();
      if ($isSectionMarkNode(parent)) {
        const children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i]);
        }
        parent.remove();
      }
    });
  } else {
    // Add or merge SectionMarkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // if the first node is a SectionMarkNode or if its
      // parent is a SectionMarkNode, we update the DATA, target and rel.
      const sectionmarkNode = $isSectionMarkNode(firstNode)
        ? firstNode
        : $getSectionMarkAncestor(firstNode);
      if (sectionmarkNode !== null) {
        sectionmarkNode.setData(data);
        return;
      }
    }
    let prevParent = null;
    let sectionmarkNode = null;
    nodes.forEach((node) => {
      const parent = node.getParent();
      if (
        parent === sectionmarkNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return;
      }
      if ($isSectionMarkNode(parent)) {
        sectionmarkNode = parent;
        parent.setData(data);
        return;
      }
      if (!parent.is(prevParent)) {
        prevParent = parent;
        sectionmarkNode = $createSectionMarkNode(data);
        if ($isSectionMarkNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(sectionmarkNode);
          } else {
            parent.insertAfter(sectionmarkNode);
          }
        } else {
          node.insertBefore(sectionmarkNode);
        }
      }
      if ($isSectionMarkNode(node)) {
        if (node.is(sectionmarkNode)) {
          return;
        }
        if (sectionmarkNode !== null) {
          const children = node.getChildren();
          for (let i = 0; i < children.length; i++) {
            sectionmarkNode.append(children[i]);
          }
        }
        node.remove();
        return;
      }
      if (sectionmarkNode !== null) {
        sectionmarkNode.append(node);
      }
    });
  }
}
function $getSectionMarkAncestor(node) {
  return $getAncestor(node, $isSectionMarkNode);
}
function $getAncestor(node, predicate) {
  let parent = node;
  while (
    parent !== null &&
    (parent = parent.getParent()) !== null &&
    !predicate(parent)
  );
  return parent;
}
