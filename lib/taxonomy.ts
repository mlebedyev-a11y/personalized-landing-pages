import {
  TrendingUp,
  Radar,
  Shuffle,
  SlidersHorizontal,
  BookOpen,
  Plug,
  CalendarClock,
  Network,
  Boxes,
  type LucideIcon,
} from "lucide-react";

export type Category = "capacity" | "foresight" | "variability" | "priority" | "knowledge" | "integration";

export interface CategoryStyle {
  icon: LucideIcon;
  color: string; // text/icon color
  tint: string; // soft background tint for badges/cards
  ring: string; // border/ring color, slightly stronger than tint
}

export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  capacity: { icon: TrendingUp, color: "#4164FF", tint: "#EEF1FF", ring: "#D3DAFF" },
  foresight: { icon: Radar, color: "#B45309", tint: "#FEF3E2", ring: "#FCE2B8" },
  variability: { icon: Shuffle, color: "#7C3AED", tint: "#F3EEFE", ring: "#E0D2FC" },
  priority: { icon: SlidersHorizontal, color: "#0D9488", tint: "#E9FBF8", ring: "#BFF1E9" },
  knowledge: { icon: BookOpen, color: "#BE185D", tint: "#FDF0F6", ring: "#F9CFE3" },
  integration: { icon: Plug, color: "#475569", tint: "#F1F4F7", ring: "#DBE2E8" },
};

// Product-specific icons (products span categories loosely; icon chosen per product identity).
export const PRODUCT_ICONS: Record<string, LucideIcon> = {
  "flex-planner": CalendarClock,
  "flex-global": Network,
  "flex-local": Shuffle,
  spotlight: Radar,
  autotune: SlidersHorizontal,
  "flex-aps": Boxes,
  "flex-capacitor": TrendingUp,
};
