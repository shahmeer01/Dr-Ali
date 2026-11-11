"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/admin/actions";

/**
 * Client wrapper around the logout server action. Next.js server actions
 * have built-in origin (CSRF) protection; no secrets cross the wire here.
 */
export function LogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void logoutAction();
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
