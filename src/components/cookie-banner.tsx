import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "aiom.cookieConsent.v1";

type Prefs = {
  essential: true; // always on
  analytics: boolean;
  decidedAt: string;
};

function readPrefs(): Prefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Prefs;
  } catch {
    return null;
  }
}

function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readPrefs();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
    }
  }, []);

  const persist = (analyticsOn: boolean) => {
    savePrefs({
      essential: true,
      analytics: analyticsOn,
      decidedAt: new Date().toISOString(),
    });
    setAnalytics(analyticsOn);
    setVisible(false);
    setManageOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-4 shadow-card-lg sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted sm:flex">
              <Cookie className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-sm text-foreground">
              <div className="font-semibold">We use minimal cookies</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Essential cookies keep the app working. You can opt in to
                anonymous analytics that help us improve recommendations. See
                our{" "}
                <Link
                  to="/privacy"
                  className="underline-offset-4 hover:underline text-foreground"
                >
                  Privacy
                </Link>{" "}
                page for details.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManageOpen(true)}
              >
                Manage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => persist(false)}
              >
                Essential only
              </Button>
              <Button size="sm" onClick={() => persist(true)}>
                Accept all
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies you allow. You can change this anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Essential
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Required for the site to function. Always on.
                </p>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Analytics
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Anonymous usage signals to help us improve recommendations.
                </p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => persist(analytics)}>
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
