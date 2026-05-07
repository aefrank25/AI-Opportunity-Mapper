import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Admin" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setErr("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErr(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
    });
    if (result.error) {
      setErr(result.error instanceof Error ? result.error.message : "Google sign-in failed.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  };

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-md py-10 sm:py-16">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-lg sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin access only. Contact the project owner for permissions.
          </p>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setErr(null);
            }}
            className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>

          <div className="mt-6 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">← Back to site</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
