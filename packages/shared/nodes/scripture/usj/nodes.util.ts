/** RegEx to test for a string only containing digits. */
export const ONLY_DIGITS_TEST = /^\d+$/;

const NUMBERED_STYLE_PLACEHOLDER = "#";

/**
 * Check if the style is valid and numbered.
 * @param style - style to check.
 * @param numberedStyles - list of valid numbered styles.
 * @returns true if the style is a valid numbered style, false otherwise.
 */
export function isValidNumberedStyle(style: string, numberedStyles: string[]): boolean {
  // Starts with a valid numbered style.
  const numberedStyle = numberedStyles.find((styleNumbered) => style.startsWith(styleNumbered));
  if (!numberedStyle) return false;

  // Ends with a number.
  const maybeNumber = style.slice(numberedStyle.length);
  return ONLY_DIGITS_TEST.test(maybeNumber);
}

/**
 * Extracts a list of numbered styles with the '#' removed.
 * @param styles - list of styles containing placeholder numbered styles, e.g. ['p', 'pi#'].
 * @returns list of numbered styles (non-numbered are filtered out) with the '#' removed,
 *   e.g. ['pi'].
 */
export function extractNumberedStyles(styles: string[] | readonly string[]): string[] {
  return (
    styles
      .filter((style) => style.endsWith(NUMBERED_STYLE_PLACEHOLDER))
      // remove placeholder
      .map((style) => style.slice(0, -1))
  );
}

/**
 * Extracts a list of non-numbered styles.
 * @param styles - list of styles containing placeholder numbered styles, e.g. ['p', 'pi#'].
 * @returns list of non-numbered styles (numbered are filtered out), e.g. ['p'].
 */
export function extractNonNumberedStyles(styles: string[] | readonly string[]): string[] {
  return styles.filter((style) => !style.endsWith(NUMBERED_STYLE_PLACEHOLDER));
}
