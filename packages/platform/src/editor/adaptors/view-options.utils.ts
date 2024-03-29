import {
  ViewMode,
  formattedViewMode as defaultViewMode,
  formattedViewMode,
  unformattedViewMode,
} from "../plugins/toolbar/view-mode.model";

export type ViewOptions = {
  /** USFM markers are visible, editable or hidden */
  markerMode: "visible" | "editable" | "hidden";
  /** is the text indented */
  isIndented: boolean;
  /** is the text in a plain font */
  isPlainFont: boolean;
};

/**
 * Get view option properties based on the view mode.
 * @param viewMode - View mode of the editor.
 * @returns the view options if the view is defined, `undefined` otherwise.
 */
export function getViewOptions(viewMode: string | undefined): ViewOptions | undefined {
  let viewOptions: ViewOptions | undefined;
  switch (viewMode ?? defaultViewMode) {
    case formattedViewMode:
      viewOptions = {
        markerMode: "hidden",
        isIndented: true,
        isPlainFont: false,
      };
      break;
    case unformattedViewMode:
      viewOptions = {
        markerMode: "editable",
        isIndented: false,
        isPlainFont: true,
      };
      break;
    default:
      break;
  }
  return viewOptions;
}

/**
 * Convert view options to view mode if the view exists.
 * @param viewOptions - View options of the editor.
 * @returns the view mode if the view is defined, `undefined` otherwise.
 */
export function viewOptionsToMode(viewOptions: ViewOptions | undefined): ViewMode | undefined {
  if (!viewOptions) return undefined;

  const { markerMode, isIndented, isPlainFont } = viewOptions;
  if (markerMode === "hidden" && isIndented && !isPlainFont) return formattedViewMode;
  if (markerMode === "editable" && !isIndented && isPlainFont) return unformattedViewMode;
  return undefined;
}
