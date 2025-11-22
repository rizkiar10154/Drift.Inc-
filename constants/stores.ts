// /constants/stores.ts
export const STORE_LOCATIONS = [
  "Drift.Inc - Central Park Jakarta",
  "Drift.Inc - Grand City Surabaya",
  "Drift.Inc - Istana Plaza Bandung",
  "Drift.Inc - Panakukkang Makassar",
  "Drift.Inc - Mega Mall Manado",
] as const;

export type StoreLocation = (typeof STORE_LOCATIONS)[number];
