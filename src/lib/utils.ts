// ─── Utility helpers ───

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const AVAILABILITY_LABELS: Record<string, string> = {
  morning_only: "Morning Only",
  lunch_dinner: "Lunch & Dinner",
  all_day: "All Day",
};

export const DIETARY_LABELS: Record<string, string> = {
  veg: "Veg",
  nonveg: "Non-Veg",
  vegan: "Vegan",
  egg: "Egg",
};
