"use client";

import { useEffect, useMemo, useRef, useState, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  saveProductAction,
  type ProductSaveState,
} from "@/app/admin/(protected)/products/actions";
import { MAX_GALLERY_IMAGES } from "@/lib/product-form";
import {
  resolveProductImage,
  slugifyProductName,
  type AdminProductRow,
} from "@/lib/product-shared";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** One image tile in the admin gallery editor. */
type GalleryItem = {
  key: string;
  kind: "existing" | "legacy" | "new";
  /** Row id — only for `existing` entries (never a storage path). */
  id?: string;
  /** The picked file — only for `new` entries (re-submitted on save). */
  file?: File;
  /** Preview source: storage key for saved images, object URL for new ones. */
  src: string;
  alt: string;
  isPrimary: boolean;
};

/** Exactly one primary (first entry) so the gallery is never ambiguous. */
function withPrimary(items: GalleryItem[]): GalleryItem[] {
  if (items.length === 0) return items;
  if (items.some((item) => item.isPrimary)) return items;
  return items.map((item, index) => (index === 0 ? { ...item, isPrimary: true } : item));
}

/**
 * Seed the editor from the saved product: gallery rows in display order,
 * or — for legacy single-image products with no rows yet — a virtual
 * entry for `products.image_path` (materialised as a row on first save).
 */
function buildInitialGallery(product?: AdminProductRow): GalleryItem[] {
  if (!product) return [];
  const rows = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const items: GalleryItem[] = rows.map((row) => ({
    key: row.id,
    kind: "existing",
    id: row.id,
    src: resolveProductImage(row.image_path) ?? "",
    alt: row.alt_text ?? "",
    isPrimary: row.is_primary,
  }));
  if (items.length === 0) {
    const legacySrc = resolveProductImage(product.image_path);
    if (legacySrc) {
      items.push({
        key: "legacy",
        kind: "legacy",
        src: legacySrc,
        alt: product.image_alt ?? "",
        isPrimary: true,
      });
    }
  }
  // Keep the first primary only (the DB unique index allows just one).
  let primarySeen = false;
  const normalized = items.map((item) => {
    if (!item.isPrimary || primarySeen) return { ...item, isPrimary: false };
    primarySeen = true;
    return item;
  });
  return withPrimary(normalized);
}

const fieldClass = (invalid?: boolean) =>
  [
    "mt-2 h-11 w-full rounded-control border bg-white px-3.5 text-base text-charcoal",
    "placeholder:text-muted transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus:border-forest focus:shadow-[0_0_0_3px_rgba(24,61,50,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
    "disabled:pointer-events-none disabled:opacity-60",
    invalid ? "border-[#a03d2e]" : "border-border-subtle",
  ].join(" ");

const labelClass = "block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted";
const errorClass = "mt-1.5 text-[13px] text-[#a03d2e]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={errorClass}>
      {message}
    </p>
  );
}

function Toggle({
  id,
  name,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-control border border-border-subtle bg-white px-4 py-3.5 transition-colors duration-[180ms] hover:border-forest/30"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#183d32]"
      />
      <span>
        <span className="block text-[15px] font-medium text-charcoal">{label}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
          {description}
        </span>
      </span>
    </label>
  );
}

/**
 * Create/edit product form. Submits multipart FormData to the save
 * server action (which validates again server-side and enforces admin
 * role + RLS). Image files upload inside the action via the admin's
 * session — no path is ever accepted from the browser.
 */
export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProductRow;
  categories: CategoryOption[];
}) {
  const [state, formAction, isPending] = useActionState<ProductSaveState, FormData>(
    saveProductAction,
    null,
  );

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const slugTouched = useRef(product ? true : false);

  const [gallery, setGallery] = useState<GalleryItem[]>(() => buildInitialGallery(product));
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Kept fresh so the unmount cleanup can revoke every object URL we made.
  const galleryRef = useRef(gallery);

  useEffect(() => {
    return () => {
      for (const item of galleryRef.current) {
        if (item.kind === "new") URL.revokeObjectURL(item.src);
      }
    };
  }, []);

  // Keep the named file input's FileList aligned with the gallery state so
  // the FormData order always matches the plan's `new` entries (removing or
  // reordering never desynchronises files from their previews).
  useEffect(() => {
    galleryRef.current = gallery;
    const input = fileInputRef.current;
    if (!input) return;
    const dataTransfer = new DataTransfer();
    for (const item of gallery) {
      if (item.kind === "new" && item.file) dataTransfer.items.add(item.file);
    }
    input.files = dataTransfer.files;
  }, [gallery]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched.current) setSlug(slugifyProductName(value));
  }

  function handleAddFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    let error: string | null = null;
    const added: GalleryItem[] = [];
    for (const file of Array.from(list)) {
      if (gallery.length + added.length >= MAX_GALLERY_IMAGES) {
        error = `You can keep up to ${MAX_GALLERY_IMAGES} images per product.`;
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        error = "Use JPEG, PNG, WebP, or AVIF images.";
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        error = "Each image must be 5 MB or smaller.";
        continue;
      }
      added.push({
        key: `new-${crypto.randomUUID()}`,
        kind: "new",
        file,
        src: URL.createObjectURL(file),
        alt: "",
        isPrimary: false,
      });
    }
    setGalleryError(error);
    if (added.length === 0) return;
    setGallery((prev) => withPrimary([...prev, ...added]));
    // Allow re-picking the same file name later in the session.
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function setPrimaryItem(key: string) {
    setGallery((prev) => prev.map((item) => ({ ...item, isPrimary: item.key === key })));
  }

  function moveItem(key: string, delta: number) {
    setGallery((prev) => {
      const index = prev.findIndex((item) => item.key === key);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeItem(key: string) {
    setGallery((prev) => {
      const removed = prev.find((item) => item.key === key);
      if (removed?.kind === "new") URL.revokeObjectURL(removed.src);
      return withPrimary(prev.filter((item) => item.key !== key));
    });
  }

  function setItemAlt(key: string, alt: string) {
    setGallery((prev) => prev.map((item) => (item.key === key ? { ...item, alt } : item)));
  }

  const galleryPlanJson = useMemo(
    () =>
      JSON.stringify(
        gallery.map((item) => ({
          kind: item.kind,
          id: item.kind === "existing" ? (item.id ?? null) : null,
          alt: item.alt,
          isPrimary: item.isPrimary,
        })),
      ),
    [gallery],
  );

  const fieldErrors = state?.fieldErrors ?? {};
  const galleryFieldError = fieldErrors.gallery ?? galleryError;

  return (
    <form action={formAction} noValidate className="grid gap-8 lg:grid-cols-12">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {/* Main column */}
      <div className="flex flex-col gap-6 lg:col-span-8">
        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Product details
          </h2>

          <div className="mt-5">
            <label htmlFor="pf-name" className={labelClass}>
              Product name *
            </label>
            <input
              id="pf-name"
              name="name"
              type="text"
              required
              maxLength={200}
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? "pf-name-error" : undefined}
              className={fieldClass(!!fieldErrors.name)}
              placeholder="e.g. Premium dog food, 3 kg"
              disabled={isPending}
            />
            <FieldError id="pf-name-error" message={fieldErrors.name} />
          </div>

          <div className="mt-5">
            <label htmlFor="pf-slug" className={labelClass}>
              Slug
            </label>
            <input
              id="pf-slug"
              name="slug"
              type="text"
              maxLength={100}
              value={slug}
              onChange={(event) => {
                slugTouched.current = true;
                setSlug(event.target.value.toLowerCase());
              }}
              aria-invalid={fieldErrors.slug ? true : undefined}
              aria-describedby={
                fieldErrors.slug
                  ? "pf-slug-error"
                  : "pf-slug-hint"
              }
              className={fieldClass(!!fieldErrors.slug)}
              placeholder="generated-from-name"
              disabled={isPending}
            />
            <FieldError id="pf-slug-error" message={fieldErrors.slug} />
            {!fieldErrors.slug ? (
              <p id="pf-slug-hint" className="mt-1.5 text-[13px] text-muted">
                Used in the URL — generated from the name, editable.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-brand" className={labelClass}>
                Brand
              </label>
              <input
                id="pf-brand"
                name="brand"
                type="text"
                maxLength={120}
                defaultValue={product?.brand ?? ""}
                aria-invalid={fieldErrors.brand ? true : undefined}
                aria-describedby={fieldErrors.brand ? "pf-brand-error" : undefined}
                className={fieldClass(!!fieldErrors.brand)}
                placeholder="Brand name (optional)"
                disabled={isPending}
              />
              <FieldError id="pf-brand-error" message={fieldErrors.brand} />
            </div>
            <div>
              <label htmlFor="pf-category" className={labelClass}>
                Category *
              </label>
              <select
                id="pf-category"
                name="category_id"
                required
                defaultValue={product?.category_id ?? ""}
                aria-invalid={fieldErrors.category_id ? true : undefined}
                aria-describedby={
                  fieldErrors.category_id ? "pf-category-error" : undefined
                }
                className={fieldClass(!!fieldErrors.category_id)}
                disabled={isPending}
              >
                <option value="">Choose a category…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.is_active ? "" : " (inactive)"}
                  </option>
                ))}
              </select>
              <FieldError id="pf-category-error" message={fieldErrors.category_id} />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="pf-description" className={labelClass}>
              Description *
            </label>
            <textarea
              id="pf-description"
              name="description"
              required
              rows={3}
              maxLength={2000}
              defaultValue={product?.description ?? ""}
              aria-invalid={fieldErrors.description ? true : undefined}
              aria-describedby={
                fieldErrors.description ? "pf-description-error" : undefined
              }
              className={[
                fieldClass(!!fieldErrors.description),
                "h-auto min-h-[96px] resize-y py-3 leading-relaxed",
              ].join(" ")}
              placeholder="Short factual summary shown on cards and at the top of the product page."
              disabled={isPending}
            />
            <FieldError id="pf-description-error" message={fieldErrors.description} />
          </div>

          <div className="mt-5">
            <label htmlFor="pf-details" className={labelClass}>
              Details
            </label>
            <textarea
              id="pf-details"
              name="details"
              rows={5}
              maxLength={10000}
              defaultValue={product?.details ?? ""}
              aria-invalid={fieldErrors.details ? true : undefined}
              aria-describedby={fieldErrors.details ? "pf-details-error" : undefined}
              className={[
                fieldClass(!!fieldErrors.details),
                "h-auto min-h-[128px] resize-y py-3 leading-relaxed",
              ].join(" ")}
              placeholder="Longer copy for the product page (optional)."
              disabled={isPending}
            />
            <FieldError id="pf-details-error" message={fieldErrors.details} />
          </div>
        </div>

        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Pricing &amp; stock
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-price" className={labelClass}>
                Price (PKR)
              </label>
              <input
                id="pf-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={product?.price != null ? String(product.price) : ""}
                aria-invalid={fieldErrors.price ? true : undefined}
                aria-describedby={fieldErrors.price ? "pf-price-error" : "pf-price-hint"}
                className={fieldClass(!!fieldErrors.price)}
                placeholder="0.00"
                disabled={isPending}
              />
              <FieldError id="pf-price-error" message={fieldErrors.price} />
              {!fieldErrors.price ? (
                <p id="pf-price-hint" className="mt-1.5 text-[13px] text-muted">
                  What the customer pays. Leave empty until the price is confirmed.
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="pf-compare-price" className={labelClass}>
                Compare price (PKR)
              </label>
              <input
                id="pf-compare-price"
                name="compare_price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={
                  product?.compare_price != null ? String(product.compare_price) : ""
                }
                aria-invalid={fieldErrors.compare_price ? true : undefined}
                aria-describedby={
                  fieldErrors.compare_price
                    ? "pf-compare-price-error"
                    : "pf-compare-price-hint"
                }
                className={fieldClass(!!fieldErrors.compare_price)}
                placeholder="0.00"
                disabled={isPending}
              />
              <FieldError
                id="pf-compare-price-error"
                message={fieldErrors.compare_price}
              />
              {!fieldErrors.compare_price ? (
                <p
                  id="pf-compare-price-hint"
                  className="mt-1.5 text-[13px] text-muted"
                >
                  Optional original price before a discount — shown struck
                  through with the saving. Must be higher than the price.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-size" className={labelClass}>
                Pack size
              </label>
              <input
                id="pf-size"
                name="size"
                type="text"
                maxLength={60}
                defaultValue={product?.size ?? ""}
                aria-invalid={fieldErrors.size ? true : undefined}
                aria-describedby={fieldErrors.size ? "pf-size-error" : undefined}
                className={fieldClass(!!fieldErrors.size)}
                placeholder="e.g. 3 kg, 500 ml"
                disabled={isPending}
              />
              <FieldError id="pf-size-error" message={fieldErrors.size} />
            </div>
            <div>
              <label htmlFor="pf-availability" className={labelClass}>
                Availability
              </label>
              <select
                id="pf-availability"
                name="availability"
                defaultValue={product?.availability ?? ""}
                aria-invalid={fieldErrors.availability ? true : undefined}
                aria-describedby={
                  fieldErrors.availability ? "pf-availability-error" : undefined
                }
                className={fieldClass(!!fieldErrors.availability)}
                disabled={isPending}
              >
                <option value="">Not stated</option>
                <option value="in-stock">In stock</option>
                <option value="on-request">Available on request</option>
                <option value="unavailable">Currently unavailable</option>
              </select>
              <FieldError id="pf-availability-error" message={fieldErrors.availability} />
            </div>
          </div>
        </div>
      </div>

      {/* Side column */}
      <div className="flex flex-col gap-6 lg:col-span-4">
        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Product images
          </h2>

          {/* Server derives every storage path from this plan + the files. */}
          <input type="hidden" name="gallery_plan" value={galleryPlanJson} />

          {gallery.length === 0 ? (
            <div className="mt-4 flex aspect-square w-full items-center justify-center rounded-control border border-dashed border-border-subtle bg-ivory/50">
              <ImagePlus className="h-8 w-8 text-forest/30" aria-hidden="true" />
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {gallery.map((item, index) => (
                <li
                  key={item.key}
                  className={[
                    "rounded-control border p-2.5 transition-colors",
                    item.isPrimary
                      ? "border-forest/40 shadow-[0_0_0_3px_rgba(24,61,50,0.08)]"
                      : "border-border-subtle",
                  ].join(" ")}
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border border-border-subtle bg-sage/20">
                      {item.kind === "new" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview before upload
                        <img
                          src={item.src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.src}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-5 items-center rounded-full bg-ivory px-2 text-[11px] font-semibold tabular-nums text-muted">
                          {index + 1}
                        </span>
                        {item.isPrimary ? (
                          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-forest px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                            <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" />
                            Primary
                          </span>
                        ) : null}
                        {item.kind === "legacy" ? (
                          <span className="text-[11px] uppercase tracking-[0.08em] text-muted">
                            Current image
                          </span>
                        ) : null}
                        {item.kind === "new" ? (
                          <span className="text-[11px] uppercase tracking-[0.08em] text-forest">
                            Not saved yet
                          </span>
                        ) : null}
                      </div>
                      <input
                        type="text"
                        maxLength={200}
                        value={item.alt}
                        onChange={(event) => setItemAlt(item.key, event.target.value)}
                        placeholder="Alt text — describe this photo"
                        aria-label={`Alt text for image ${index + 1}`}
                        className="h-9 w-full rounded-control border border-border-subtle bg-white px-2.5 text-[13px] text-charcoal transition-[border-color,box-shadow] duration-[180ms] placeholder:text-muted focus:border-forest focus:shadow-[0_0_0_3px_rgba(24,61,50,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:pointer-events-none disabled:opacity-60"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveItem(item.key, -1)}
                      disabled={isPending || index === 0}
                      aria-label={`Move image ${index + 1} earlier`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-control border border-border-subtle bg-white text-charcoal transition-colors hover:border-forest/40 hover:text-forest disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(item.key, 1)}
                      disabled={isPending || index === gallery.length - 1}
                      aria-label={`Move image ${index + 1} later`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-control border border-border-subtle bg-white text-charcoal transition-colors hover:border-forest/40 hover:text-forest disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimaryItem(item.key)}
                      disabled={isPending || item.isPrimary}
                      aria-label={`Make image ${index + 1} the primary image`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-control border border-border-subtle bg-white px-2.5 text-[12px] font-medium text-charcoal transition-colors hover:border-forest/40 hover:text-forest disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      Make primary
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      disabled={isPending}
                      aria-label={`Remove image ${index + 1}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-control border border-border-subtle bg-white px-2.5 text-[12px] font-medium text-[#a03d2e] transition-colors hover:border-[#a03d2e]/40 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <label htmlFor="pf-images" className={labelClass}>
              Add images
            </label>
            <input
              ref={fileInputRef}
              id="pf-images"
              name="images"
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(event) => handleAddFiles(event.target.files)}
              aria-describedby={galleryFieldError ? "pf-images-error" : "pf-images-hint"}
              className="mt-2 block w-full text-[14px] text-muted file:mr-3 file:cursor-pointer file:rounded-control file:border-0 file:bg-ivory file:px-4 file:py-2.5 file:text-[14px] file:font-medium file:text-forest hover:file:bg-sage/50"
              disabled={isPending}
            />
            <FieldError id="pf-images-error" message={galleryFieldError ?? undefined} />
            {!galleryFieldError ? (
              <p id="pf-images-hint" className="mt-1.5 text-[13px] text-muted">
                JPEG, PNG, WebP, or AVIF — up to 5&nbsp;MB each, {MAX_GALLERY_IMAGES} images
                max. Drag the order with the arrows; the primary image is what cards and
                search results show.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Visibility
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            <Toggle
              id="pf-published"
              name="is_published"
              label="Published"
              description="Shown on the public catalogue, category pages, and product pages. Turn off to hide it everywhere — drafts are visible only here in the admin."
              defaultChecked={product?.is_published ?? false}
            />
            <Toggle
              id="pf-featured"
              name="is_featured"
              label="Featured"
              description="Pinned to the top of listings and shown in “Selected products” on the homepage. A featured product still stays hidden everywhere until Published is on."
              defaultChecked={product?.is_featured ?? false}
            />
          </div>
        </div>

        {state?.error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-card border border-[#a03d2e]/30 bg-[#a03d2e]/5 px-4 py-3 text-[14px] text-[#a03d2e]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            {isPending
              ? "Saving…"
              : product
                ? "Save changes"
                : "Create product"}
          </Button>
          <Button
            href="/admin/products"
            type="button"
            variant="secondary"
            size="lg"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </Button>
        </div>

        {product?.is_published ? (
          <p className="text-[13px] leading-relaxed text-muted">
            Currently live:{" "}
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-forest underline underline-offset-4"
            >
              /products/{product.slug}
            </Link>
          </p>
        ) : null}
      </div>
    </form>
  );
}
