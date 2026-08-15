export const FLOOR_SECTIONS = [
  { id: "MAIN_FLOOR", label: "Main Floor" },
  { id: "FIRST_FLOOR", label: "1st Floor" },
  { id: "BAR", label: "Bar" },
  { id: "TAKEAWAY", label: "Takeaway" },
] as const;

export type FloorSectionId = (typeof FLOOR_SECTIONS)[number]["id"];

/** Prefer Main Floor so the first sidebar tab matches the default view. */
export const DEFAULT_FLOOR_SECTION: FloorSectionId = "MAIN_FLOOR";

const FLOOR_SECTION_IDS = new Set<FloorSectionId>(
  FLOOR_SECTIONS.map((section) => section.id),
);

export function normalizeFloorSection(
  area?: string | null,
): FloorSectionId {
  if (area && FLOOR_SECTION_IDS.has(area as FloorSectionId)) {
    return area as FloorSectionId;
  }
  return DEFAULT_FLOOR_SECTION;
}
