"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Loader2, Star, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  deleteProductAction,
  toggleProductFieldAction,
} from "@/app/admin/(protected)/products/actions";

/**
 * Per-row controls: publish/unpublish, feature/unfeature, and delete
 * (behind a confirmation dialog). All mutations run through server
 * actions; this component only manages pending/error UI state.
 */
export function ProductRowActions({
  id,
  name,
  isPublished,
  isFeatured,
}: {
  id: string;
  name: string;
  isPublished: boolean;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  function toggle(field: "is_published" | "is_featured", value: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleProductFieldAction(id, field, value);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(id);
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
        onClick={() => toggle("is_published", !isPublished)}
        aria-label={isPublished ? `Unpublish ${name}` : `Publish ${name}`}
        title={isPublished ? "Unpublish" : "Publish"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-forest disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isPublished ? (
          <Eye className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => toggle("is_featured", !isFeatured)}
        aria-label={isFeatured ? `Remove ${name} from featured` : `Feature ${name}`}
        title={isFeatured ? "Unfeature" : "Feature"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-forest disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <Star
          className={`h-4 w-4 ${isFeatured ? "fill-amber text-amber" : ""}`}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${name}`}
        title="Delete"
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
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            className="w-full max-w-sm rounded-card border border-border-subtle bg-white p-6 shadow-card-hover"
          >
            <h2
              id="delete-dialog-title"
              className="font-display text-[20px] font-medium tracking-[-0.01em] text-charcoal"
            >
              Delete this product?
            </h2>
            <p
              id="delete-dialog-desc"
              className="mt-2 text-[15px] leading-relaxed text-muted"
            >
              “{name}” will be removed from the admin list and the public
              catalogue. This cannot be undone.
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
