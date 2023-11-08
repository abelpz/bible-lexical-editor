/** Separator between parts of a serialized USJ type */
const USJ_TYPE_SEPARATOR = ":";

/** String version of a USJ type. Consists of two strings concatenated by a colon */
export type SerializedUsjType = `${string}${typeof USJ_TYPE_SEPARATOR}${string}`;

/** Information about a USJ type broken into its parts */
export type UsjType = {
  /** USX element */
  element: string;
  /** USX style attribute */
  style: string;
};

/**
 * Create a USJ type string from an element and a style.
 * @param element - the general element identifier of this type.
 * @param style - the specific style identifier for this type.
 * @returns string serialized USJ type.
 */
export function serializeUsjType(element: string, style: string): SerializedUsjType {
  if (!element) throw new Error('serializeUsjType: "element" is not defined or empty.');
  if (!style) throw new Error('serializeUsjType: "style" is not defined or empty.');

  return `${element}${USJ_TYPE_SEPARATOR}${style}`;
}

/**
 * Split a USJ type string into its parts.
 * @param usjType - represents a USJ type.
 * @returns the USX element and style parts.
 */
export function deserializeUsjType(usjType: SerializedUsjType | string): UsjType {
  if (!usjType) throw new Error("deserializeUsjType: must be a non-empty string");

  const colonIndex = usjType.indexOf(USJ_TYPE_SEPARATOR);
  if (colonIndex <= 0 || colonIndex >= usjType.length - 1)
    throw new Error(`deserializeUsjType: Must have two parts divided by a ${USJ_TYPE_SEPARATOR}`);
  const element = usjType.substring(0, colonIndex);
  const style = usjType.substring(colonIndex + 1);
  return { element, style };
}
