// /constants/categories.ts
export const GALLERY_CATEGORIES = [
  "Race Day",
  "Training",
  "Event",
  "Highlight",
  "Customer Moments",
  "Announcement",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
