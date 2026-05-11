import { toast } from "sonner";

export function focusUnlockEmail() {
  if (typeof document === "undefined") return;
  const section = document.getElementById("unlock-section");
  const input = document.getElementById("unlock-email") as HTMLInputElement | null;
  if (!section && !input) {
    toast("Expanded Opportunity Map is planned for the next version.");
    return;
  }
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    const el = document.getElementById("unlock-email") as HTMLInputElement | null;
    el?.focus({ preventScroll: true });
  }, 400);
}
