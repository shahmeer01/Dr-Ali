"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from "@/app/admin/(protected)/categories/actions";

/**
 * Per-row controls: show/hide (is_active) and delete (behind a
 * confirmation dialog). Delete is disabled while the category still has
 * products — the server enforces the same rule regardless.
 */
export function CategoryRowActions({
  id,
  name,
  isActive,
  productCount,
}: {
  id: string;
  name: string;
  isActive: boolean;
  productCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const hasProducts = productCount > 0;

  function toggle(value: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleCategoryActiveAction(id, value);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
      } else {
        setConfirming(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => toggle(!isActive)}
        aria-label={isActive ? `Hide ${name}` : `Show ${name}`}
        title={isActive ? "Hide from public site" : "Show on public site"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-forest disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isActive ? (
          <Eye className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        disabled={isPending || hasProducts}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${name}`}
        title={
          hasProducts
            ? `Reassign its ${productCount} product${productCount === 1 ? "" : "s"} first`
            : "Delete"
        }
        className="inline-flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-[#a03d2e]/10 hover:text-[#a03d2e] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a03d2e]"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {error ? (
        <p role="alert" className="sr-only">
          {error}
        </p>
      ) : null}

      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isPending) setConfirming(false);
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-dialog-title"
            aria-describedby="delete-category-dialog-desc"
            className="w-full max-w-sm rounded-card border border-border-subtle bg-white p-6 shadow-card-hover"
          >
            <h2
              id="delete-category-dialog-title"
              className="font-display text-[20px] font-medium tracking-[-0.01em] text-charcoal"
            >
              Delete this category?
            </h2>
            <p
              id="delete-category-dialog-desc"
              className="mt-2 text-[15px] leading-relaxed text-muted"
            >
              “{name}” will be removed from navigation, tiles, and the admin
              list. This cannot be undone.
            </p>
            {error ? (
              <p role="alert" className="mt-3 text-[14px] text-[#a03d2e]">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isPending}
                onClick={confirmDelete}
                className="bg-[#a03d2e] hover:bg-[#8a3327] focus-visible:outline-[#a03d2e]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
