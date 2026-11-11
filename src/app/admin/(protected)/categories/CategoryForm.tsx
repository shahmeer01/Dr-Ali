"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  saveCategoryAction,
  type CategorySaveState,
} from "@/app/admin/(protected)/categories/actions";
import {
  resolveProductImage,
  slugifyProductName,
  type AdminCategoryDetailRow,
} from "@/lib/product-shared";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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

type ParentOption = { id: string; name: string };

/**
 * Create/edit category form. Submits FormData to the save server action
 * (which validates again server-side and enforces admin role + RLS).
 * The optional tile image uploads inside the action via the admin's
 * session — no path is ever accepted from the browser.
 *
 * `parentOptions` holds only eligible parents (the server pre-filters the
 * category itself and its descendants out of the list; the action
 * re-validates the submitted choice regardless).
 */
export function CategoryForm({
  category,
  parentOptions,
}: {
  category?: AdminCategoryDetailRow;
  parentOptions: ParentOption[];
}) {
  const [state, formAction, isPending] = useActionState<CategorySaveState, FormData>(
    saveCategoryAction,
    null,
  );

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const slugTouched = useRef(category ? true : false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const currentImage = resolveProductImage(category?.image_path) ?? null;

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched.current) setSlug(slugifyProductName(value));
  }

  function handleImageChange(file: File | null) {
    setImageError(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Use a JPEG, PNG, WebP, or AVIF image.");
      setImageFile(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("The image must be 5 MB or smaller.");
      setImageFile(null);
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  const fieldErrors = state?.fieldErrors ?? {};
  const showImagePreview = imageFile && imagePreviewUrl;

  return (
    <form action={formAction} noValidate className="grid gap-8 lg:grid-cols-12">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      {/* Main column */}
      <div className="flex flex-col gap-6 lg:col-span-8">
        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Category details
          </h2>

          <div className="mt-5">
            <label htmlFor="cf-name" className={labelClass}>
              Category name *
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              required
              maxLength={200}
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? "cf-name-error" : undefined}
              className={fieldClass(!!fieldErrors.name)}
              placeholder="e.g. Bird care"
              disabled={isPending}
            />
            <FieldError id="cf-name-error" message={fieldErrors.name} />
          </div>

          <div className="mt-5">
            <label htmlFor="cf-slug" className={labelClass}>
              Slug
            </label>
            <input
              id="cf-slug"
              name="slug"
              type="text"
              maxLength={100}
              value={slug}
              onChange={(event) => {
                slugTouched.current = true;
                setSlug(event.target.value.toLowerCase());
              }}
              aria-invalid={fieldErrors.slug ? true : undefined}
              aria-describedby={fieldErrors.slug ? "cf-slug-error" : "cf-slug-hint"}
              className={fieldClass(!!fieldErrors.slug)}
              placeholder="generated-from-name"
              disabled={isPending}
            />
            <FieldError id="cf-slug-error" message={fieldErrors.slug} />
            {!fieldErrors.slug ? (
              <p id="cf-slug-hint" className="mt-1.5 text-[13px] text-muted">
                Used in the URL — generated from the name, editable. Every
                active category gets its own page under /products/.
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <label htmlFor="cf-parent" className={labelClass}>
              Parent category
            </label>
            <select
              id="cf-parent"
              name="parent_category_id"
              defaultValue={category?.parent_category_id ?? ""}
              aria-invalid={fieldErrors.parent_category_id ? true : undefined}
              aria-describedby={
                fieldErrors.parent_category_id
                  ? "cf-parent-error"
                  : "cf-parent-hint"
              }
              className={fieldClass(!!fieldErrors.parent_category_id)}
              disabled={isPending}
            >
              <option value="">No parent category</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <FieldError id="cf-parent-error" message={fieldErrors.parent_category_id} />
            {!fieldErrors.parent_category_id ? (
              <p id="cf-parent-hint" className="mt-1.5 text-[13px] text-muted">
                Optional — choose a main category to file this one underneath
                it as a subcategory. Leave as &ldquo;No parent category&rdquo; for a
                top-level category.
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <label htmlFor="cf-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="cf-description"
              name="description"
              rows={3}
              maxLength={2000}
              defaultValue={category?.description ?? ""}
              aria-invalid={fieldErrors.description ? true : undefined}
              aria-describedby={fieldErrors.description ? "cf-description-error" : undefined}
              className={[
                fieldClass(!!fieldErrors.description),
                "h-auto min-h-[96px] resize-y py-3 leading-relaxed",
              ].join(" ")}
              placeholder="Short factual summary shown on the category tile and page."
              disabled={isPending}
            />
            <FieldError id="cf-description-error" message={fieldErrors.description} />
          </div>
        </div>
      </div>

      {/* Side column */}
      <div className="flex flex-col gap-6 lg:col-span-4">
        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Category image
          </h2>

          <div className="mt-4">
            {showImagePreview ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-control border border-border-subtle bg-sage/20">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview before upload */}
                <img
                  src={imagePreviewUrl}
                  alt="New category image preview"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : currentImage && !removeImage ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-control border border-border-subtle bg-sage/20">
                <Image
                  src={currentImage}
                  alt={category?.name ?? "Current category image"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-control border border-dashed border-border-subtle bg-ivory/50">
                <ImagePlus className="h-8 w-8 text-forest/30" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="cf-image" className={labelClass}>
              {category ? "Replace image" : "Upload image"}
            </label>
            <input
              id="cf-image"
              name="image"
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
              aria-describedby={imageError ? "cf-image-error" : "cf-image-hint"}
              className="mt-2 block w-full text-[14px] text-muted file:mr-3 file:cursor-pointer file:rounded-control file:border-0 file:bg-ivory file:px-4 file:py-2.5 file:text-[14px] file:font-medium file:text-forest hover:file:bg-sage/50"
              disabled={isPending}
            />
            <FieldError id="cf-image-error" message={imageError ?? undefined} />
            {!imageError ? (
              <p id="cf-image-hint" className="mt-1.5 text-[13px] text-muted">
                JPEG, PNG, WebP, or AVIF — up to 5&nbsp;MB.
              </p>
            ) : null}
          </div>

          {category?.image_path && !showImagePreview ? (
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[14px] text-charcoal">
              <input
                type="checkbox"
                name="remove_image"
                checked={removeImage}
                onChange={(event) => setRemoveImage(event.target.checked)}
                className="h-4 w-4 accent-[#a03d2e]"
                disabled={isPending}
              />
              Remove current image
            </label>
          ) : null}
        </div>

        <div className="rounded-card border border-border-subtle bg-white p-5 md:p-6">
          <h2 className="font-display text-[19px] font-medium tracking-[-0.01em] text-charcoal">
            Visibility
          </h2>
          <div className="mt-4">
            <label
              htmlFor="cf-active"
              className="flex cursor-pointer items-start gap-3 rounded-control border border-border-subtle bg-white px-4 py-3.5 transition-colors duration-[180ms] hover:border-forest/30"
            >
              <input
                id="cf-active"
                name="is_active"
                type="checkbox"
                defaultChecked={category?.is_active ?? true}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#183d32]"
                disabled={isPending}
              />
              <span>
                <span className="block text-[15px] font-medium text-charcoal">
                  Active
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                  Shown in public navigation, tiles, and filter chips. Turn off
                  to hide the category and its products from the public site.
                </span>
              </span>
            </label>
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
            {isPending ? "Saving…" : category ? "Save changes" : "Create category"}
          </Button>
          <Button
            href="/admin/categories"
            type="button"
            variant="secondary"
            size="lg"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </Button>
        </div>

        {category?.is_active ? (
          <p className="text-[13px] leading-relaxed text-muted">
            Currently visible:{" "}
            <Link
              href="/products"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-forest underline underline-offset-4"
            >
              /products
            </Link>
          </p>
        ) : null}
      </div>
    </form>
  );
}
