"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  isStorageProductPath,
  PRODUCT_IMAGES_BUCKET,
  slugifyProductName,
} from "@/lib/product-shared";

/**
 * Category mutation server actions.
 *
 * Same contract as the product actions: every action re-validates the
 * caller's session and admin role (profiles.role), then relies on RLS as
 * the hard boundary. No service-role key exists; all writes run with the
 * admin's own session. Every successful mutation invalidates the cached
 * public category list ("public-categories" tag) so navigation, footer,
 * tiles, and chips refresh immediately.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ACCEPTED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type CategorySaveState = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
} | null;

async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired. Sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { error: "You do not have permission to manage categories." };
  }
  return { userId: user.id };
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

type ParsedFields = {
  values: {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    parent_category_id: string | null;
  };
  fieldErrors: Record<string, string>;
};

function parseCategoryFields(formData: FormData): ParsedFields {
  const fieldErrors: Record<string, string> = {};

  const name = emptyToNull(formData.get("name"));
  if (!name) fieldErrors.name = "Category name is required.";
  else if (name.length > 200) fieldErrors.name = "Keep the name under 200 characters.";

  const rawSlug = emptyToNull(formData.get("slug"));
  const slug = rawSlug ?? (name ? slugifyProductName(name) : "");
  if (!slug) fieldErrors.slug = "A slug is required.";
  else if (!SLUG_RE.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers, and single hyphens only.";
  } else if (slug.length > 100) fieldErrors.slug = "Keep the slug under 100 characters.";

  const description = emptyToNull(formData.get("description")) ?? "";
  if (description.length > 2000) {
    fieldErrors.description = "Keep the description under 2,000 characters.";
  }

  // Optional hierarchy: empty select = top-level (NULL).
  const rawParent = emptyToNull(formData.get("parent_category_id"));
  let parentCategoryId: string | null = null;
  if (rawParent) {
    if (!UUID_RE.test(rawParent)) {
      fieldErrors.parent_category_id = "Choose a valid parent category.";
    } else {
      parentCategoryId = rawParent;
    }
  }

  return {
    values: {
      name: name ?? "",
      slug,
      description,
      is_active: formData.get("is_active") === "on",
      parent_category_id: parentCategoryId,
    },
    fieldErrors,
  };
}

/**
 * Guard the parent relationship beyond the form's filtered options:
 * the submitted parent must exist, must not be the category itself, and
 * must not sit anywhere in the category's own subtree (which would close
 * a cycle). Walks the ancestor chain of the proposed parent — with the
 * self-parent CHECK in the database, only a cycle could still slip past.
 */
async function validateParentChoice(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  parentId: string,
  currentId: string | null,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_category_id");
  if (error) {
    return "Could not verify the parent category right now. Try again.";
  }
  const rows = data ?? [];
  if (!rows.some((row) => row.id === parentId)) {
    return "The selected parent category no longer exists.";
  }
  if (currentId && parentId === currentId) {
    return "A category cannot be its own parent.";
  }
  // Ancestor walk: if the current category appears above the proposed
  // parent, the parent is a descendant of it — reject.
  const parentOf = new Map<string, string | null>(
    rows.map((row) => [row.id, row.parent_category_id]),
  );
  let cursor: string | null = parentId;
  let depth = 0;
  while (cursor && depth < rows.length + 1) {
    if (cursor === currentId) {
      return "Choose a parent from outside this category's own subcategories.";
    }
    cursor = parentOf.get(cursor) ?? null;
    depth += 1;
  }
  return null;
}

/**
 * Upload a validated image to Storage under the categories/ prefix and
 * return the object path (generated here, never client-supplied).
 */
async function uploadCategoryImage(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const extension = ACCEPTED_IMAGE_TYPES[file.type];
  if (!extension) {
    return { error: "Use a JPEG, PNG, WebP, or AVIF image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "The image must be 5 MB or smaller." };
  }
  const path = `categories/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });

  if (error) {
    const message = /bucket|not found|not create/i.test(error.message)
      ? "Image storage is not configured yet on this Supabase project — run the storage setup SQL, then try again."
      : `The image upload failed (${error.message}).`;
    return { error: message };
  }
  return { path };
}

async function removeStoredImage(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  path: string,
): Promise<void> {
  if (!isStorageProductPath(path)) return;
  try {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  } catch {
    // Best-effort cleanup only.
  }
}

/** Category list data is read on every public page (root layout). */
function revalidateCategorySurfaces(): void {
  // Next 16: updateTag (server actions only) expires the cached list
  // immediately so navigation/tiles/chips refresh with the next request.
  updateTag("public-categories");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

/** Create or update a category (id present = update). */
export async function saveCategoryAction(
  _prev: CategorySaveState,
  formData: FormData,
): Promise<CategorySaveState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };

  const { values, fieldErrors } = parseCategoryFields(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const idRaw = emptyToNull(formData.get("id"));
  const isUpdate = idRaw != null;
  if (isUpdate && !UUID_RE.test(idRaw)) {
    return { ok: false, error: "Invalid category id." };
  }

  if (values.parent_category_id) {
    const parentError = await validateParentChoice(
      supabase,
      values.parent_category_id,
      isUpdate ? idRaw : null,
    );
    if (parentError) {
      return {
        ok: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { parent_category_id: parentError },
      };
    }
  }

  const imageFile = formData.get("image");
  const hasNewImage = imageFile instanceof File && imageFile.size > 0;
  const removeImage = formData.get("remove_image") === "on";

  let previousImagePath: string | null = null;
  if (isUpdate) {
    const { data: existing } = await supabase
      .from("categories")
      .select("image_path")
      .eq("id", idRaw)
      .maybeSingle();
    previousImagePath = existing?.image_path ?? null;
  }

  // Upload first so a storage failure never leaves a half-written row.
  let imagePath = previousImagePath;
  if (hasNewImage) {
    const upload = await uploadCategoryImage(supabase, imageFile);
    if ("error" in upload) return { ok: false, error: upload.error };
    imagePath = upload.path;
  } else if (removeImage) {
    imagePath = null;
  }

  const row = {
    name: values.name,
    slug: values.slug,
    description: values.description,
    image_path: imagePath,
    is_active: values.is_active,
    parent_category_id: values.parent_category_id,
  };

  const result = isUpdate
    ? await supabase.from("categories").update(row).eq("id", idRaw).select("id").maybeSingle()
    : await supabase.from("categories").insert(row).select("id").maybeSingle();

  if (result.error) {
    // Only remove a fresh upload that could not be linked to any row.
    if (hasNewImage && imagePath) {
      await removeStoredImage(supabase, imagePath);
    }
    if (result.error.code === "23505") {
      return {
        ok: false,
        error: "Could not save the category.",
        fieldErrors: { slug: "This slug is already in use by another category." },
      };
    }
    return { ok: false, error: "The category could not be saved. Please try again." };
  }

  // The old image is only removed after the row saved successfully.
  if (isUpdate && hasNewImage && previousImagePath && previousImagePath !== imagePath) {
    await removeStoredImage(supabase, previousImagePath);
  }
  if (isUpdate && removeImage && previousImagePath) {
    await removeStoredImage(supabase, previousImagePath);
  }

  revalidateCategorySurfaces();
  redirect("/admin/categories?saved=1");
}

/** Flip is_active from the category table. */
export async function toggleCategoryActiveAction(
  id: string,
  value: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid category id." };
  if (typeof value !== "boolean") return { ok: false, error: "Invalid value." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: value })
    .eq("id", id);
  if (error) return { ok: false, error: "The update failed. Please try again." };

  revalidateCategorySurfaces();
  return { ok: true };
}

/**
 * Delete a category. Blocked while any product still references it —
 * checked here with a clear message (the FK's ON DELETE RESTRICT is the
 * hard backstop). Storage cleanup runs only after a successful delete.
 */
export async function deleteCategoryAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid category id." };

  const supabase = await getSupabaseServerClient();

  const countQuery = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (countQuery.error) {
    return { ok: false, error: "Could not verify the category right now. Try again." };
  }
  const productCount = countQuery.count ?? 0;
  if (productCount > 0) {
    return {
      ok: false,
      error: `This category still has ${productCount} product${productCount === 1 ? "" : "s"}. Move or delete them first.`,
    };
  }

  const { data: existing } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return { ok: false, error: "This category is still in use and cannot be deleted." };
    }
    return { ok: false, error: "The category could not be deleted. Please try again." };
  }

  if (existing?.image_path) {
    await removeStoredImage(supabase, existing.image_path);
  }

  revalidateCategorySurfaces();
  return { ok: true };
}
