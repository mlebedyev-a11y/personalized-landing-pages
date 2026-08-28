import fs from "node:fs";
import path from "node:path";
import type { Brief } from "@/lib/types";

const GENERATED_DIR = path.join(process.cwd(), "data", "generated");

export function getAllSlugs(): string[] {
  if (!fs.existsSync(GENERATED_DIR)) return [];
  return fs
    .readdirSync(GENERATED_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function getBrief(slug: string): Brief | null {
  const file = path.join(GENERATED_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Brief;
}
