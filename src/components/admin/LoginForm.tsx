"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type LoginFormProps = {
  /** Internal /admin path to return to after a successful sign-in. */
  next: string;
};

type LoginResponse = {
  ok: boolean;
  error?: string;
};

const fieldClass =
  [
    "mt-2 h-11 w-full rounded-control border bg-white px-3.5 text-base text-charcoal",
    "placeholder:text-muted transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus:border-forest focus:shadow-[0_0_0_3px_rgba(24,61,50,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
    "border-border-subtle",
  ].join(" ");

/**
 * Email + password sign-in for the admin area. Submits to the
 * POST /api/admin/login route handler, which validates Origin/JSON, runs the
 * pre-auth rate-limit gate (429 + Retry-After when over budget), and sets the
 * session cookies server-side with HttpOnly (browser JS cannot set that
 * flag); the proxy and server components then read them as usual. Errors
 * arrive pre-mapped to safe, generic copy — identical for unknown email vs.
 * wrong password, so no user enumeration. No signup — admin accounts are
 * created manually in the Supabase dashboard and promoted via SQL.
 */
export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setPending(true);
    setError(null);

    let result: LoginResponse;
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const parsed = (await response.json().catch(() => null)) as LoginResponse | null;
      result =
        parsed && typeof parsed.ok === "boolean"
          ? parsed
          : { ok: false, error: "Sign-in failed. Please try again." };
    } catch {
      result = { ok: false, error: "Sign-in failed. Please try again." };
    }

    if (!result.ok) {
      setError(result.error ?? "Sign-in failed. Please try again.");
      setPending(false);
      return;
    }

    // Session cookies were set server-side by the route; refresh re-runs
    // the server components (and the proxy) with the new session.
    router.replace(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-card border border-border-subtle bg-white p-6 md:p-8"
      aria-label="Admin sign-in form"
    >
      <div>
        <label
          htmlFor="admin-email"
          className="block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          className={fieldClass}
          placeholder="you@example.com"
          disabled={pending}
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="admin-password"
          className="block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          className={fieldClass}
          placeholder="Your password"
          disabled={pending}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 text-[14px] text-[#a03d2e]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        variant="primary"
        className="mt-6 w-full"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
