export type ViewNameKey = keyof typeof viewModeToViewNames;

export const formattedViewMode = "formatted";
export const unformattedViewMode = "unformatted";
export const viewModeToViewNames = {
  [formattedViewMode]: "Formatted",
  [unformattedViewMode]: "Unformatted",
};
