"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  emptyToNull,
  parseGalleryPlan,
  parseProductFields,
  UUID_RE,
} from "@/lib/product-form";
import {
  isStorageProductPath,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/product-shared";

/**
 * Product mutation server actions.
 *
 * Every action re-validates the caller's session and admin role (the same
 * profiles.role source of truth the protected layout uses) and then relies
 * on RLS as the hard boundary — even if these checks were bypassed, the
 * database policies reject non-admin writes. No service-role key exists in
 * this codebase; all writes run with the admin's own session.
 *
 * Field parsing/validation lives in @/lib/product-form (pure module).
 */

const ACCEPTED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ProductSaveState = {
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
    return { error: "You do not have permission to manage products." };
  }
  return { userId: user.id };
}

/**
 * Upload a validated image to Storage and return the object path.
 * The path is generated here (never client-supplied).
 */
async function uploadProductImage(
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
  const path = `products/${crypto.randomUUID()}.${extension}`;
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

/** Create or update a product with its image gallery (id present = update). */
export async function saveProductAction(
  _prev: ProductSaveState,
  formData: FormData,
): Promise<ProductSaveState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };

  const { values, fieldErrors } = parseProductFields(formData);
  const gallery = parseGalleryPlan(formData.get("gallery_plan"));
  if (gallery.fieldError) fieldErrors.gallery = gallery.fieldError;
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const plan = gallery.plan;

  // New files arrive in `images`, in the same relative order as the
  // plan's `new` entries (the form keeps the picker's FileList synced).
  const newFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const newFileCount = plan.filter((entry) => entry.kind === "new").length;
  if (newFiles.length !== newFileCount) {
    return {
      ok: false,
      error: "The selected images did not submit correctly — reload the page and try again.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const idRaw = emptyToNull(formData.get("id"));
  const isUpdate = idRaw != null;
  if (isUpdate && !UUID_RE.test(idRaw)) {
    return { ok: false, error: "Invalid product id." };
  }

  // Current gallery state — used for ownership checks, the legacy
  // single-image pointer, and post-save storage cleanup.
  let previousImagePath: string | null = null;
  let currentRows: { id: string; image_path: string }[] = [];
  if (isUpdate) {
    const [productResult, rowsResult] = await Promise.all([
      supabase.from("products").select("image_path").eq("id", idRaw).maybeSingle(),
      supabase.from("product_images").select("id, image_path").eq("product_id", idRaw),
    ]);
    if (productResult.error || rowsResult.error) {
      return { ok: false, error: "Could not load the product's images. Please try again." };
    }
    previousImagePath = productResult.data?.image_path ?? null;
    currentRows = rowsResult.data ?? [];
  } else if (plan.some((entry) => entry.kind !== "new")) {
    return { ok: false, error: "Invalid image gallery for a new product." };
  }

  // Ownership: every referenced row must already belong to this product,
  // and the legacy entry may only re-use the product's own image pointer.
  const currentPathById = new Map(currentRows.map((row) => [row.id, row.image_path]));
  const keptRowIds = new Set<string>();
  for (const entry of plan) {
    if (entry.kind === "existing") {
      if (!entry.id || !currentPathById.has(entry.id)) {
        return {
          ok: false,
          error: "One of the images no longer belongs to this product — reload the page and try again.",
        };
      }
      keptRowIds.add(entry.id);
    }
    if (entry.kind === "legacy") {
      if (!previousImagePath) {
        return {
          ok: false,
          error: "The original product image is no longer available — reload the page.",
        };
      }
      if (currentRows.some((row) => row.image_path === previousImagePath)) {
        return {
          ok: false,
          error: "The image gallery is out of sync — reload the page and try again.",
        };
      }
    }
  }

  // Upload new files first so a storage failure never touches any row.
  const uploadedPaths: string[] = [];
  const cleanupUploads = async (): Promise<void> => {
    for (const path of uploadedPaths) await removeStoredImage(supabase, path);
  };
  for (const file of newFiles) {
    const upload = await uploadProductImage(supabase, file);
    if ("error" in upload) {
      await cleanupUploads();
      return { ok: false, error: upload.error };
    }
    uploadedPaths.push(upload.path);
  }

  // Resolve every plan entry to its final storage path — paths are always
  // derived server-side; the client only ever sends row ids.
  let uploadedIndex = 0;
  const resolvedPaths: string[] = [];
  for (const entry of plan) {
    let path: string | null = null;
    if (entry.kind === "new") path = uploadedPaths[uploadedIndex++] ?? null;
    else if (entry.kind === "legacy") path = previousImagePath;
    else if (entry.id) path = currentPathById.get(entry.id) ?? null;
    if (!path) {
      await cleanupUploads();
      return {
        ok: false,
        error: "The image gallery could not be resolved — reload the page and try again.",
      };
    }
    resolvedPaths.push(path);
  }

  const primaryIndex = plan.findIndex((entry) => entry.isPrimary);
  const primaryPath = primaryIndex >= 0 ? resolvedPaths[primaryIndex] : null;
  const primaryAlt = primaryIndex >= 0 ? plan[primaryIndex].alt || null : null;

  const row = {
    name: values.name,
    slug: values.slug,
    brand: values.brand,
    category_id: values.category_id,
    description: values.description,
    details: values.details,
    price: values.price,
    compare_price: values.compare_price,
    size: values.size,
    availability: values.availability,
    // Primary pointer kept in sync with the gallery so cards, the admin
    // table, and metadata keep working unchanged.
    image_path: primaryPath,
    image_alt: primaryAlt,
    is_featured: values.is_featured,
    is_published: values.is_published,
  };

  const galleryRowsFor = (productId: string) =>
    plan.map((entry, index) => ({
      product_id: productId,
      image_path: resolvedPaths[index],
      alt_text: entry.alt || null,
      sort_order: index,
      is_primary: index === primaryIndex,
    }));

  if (!isUpdate) {
    const result = await supabase.from("products").insert(row).select("id").maybeSingle();
    if (result.error) {
      await cleanupUploads();
      if (result.error.code === "23505") {
        return {
          ok: false,
          error: "Could not save the product.",
          fieldErrors: { slug: "This slug is already in use by another product." },
        };
      }
      if (result.error.code === "23503") {
        return {
          ok: false,
          error: "Could not save the product.",
          fieldErrors: { category_id: "That category no longer exists." },
        };
      }
      return { ok: false, error: "The product could not be saved. Please try again." };
    }

    const productId = result.data?.id;
    if (plan.length > 0 && productId) {
      const galleryResult = await supabase
        .from("product_images")
        .insert(galleryRowsFor(productId));
      if (galleryResult.error) {
        // Roll the whole product back so a retry never hits a duplicate slug.
        await supabase.from("products").delete().eq("id", productId);
        await cleanupUploads();
        return { ok: false, error: "The product could not be saved. Please try again." };
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    redirect("/admin/products?saved=1");
  }

  // ---- Update ----------------------------------------------------------------
  const result = await supabase
    .from("products")
    .update(row)
    .eq("id", idRaw)
    .select("id")
    .maybeSingle();

  if (result.error) {
    // No gallery row references the fresh uploads yet — safe to roll them back.
    await cleanupUploads();
    if (result.error.code === "23505") {
      return {
        ok: false,
        error: "Could not save the product.",
        fieldErrors: { slug: "This slug is already in use by another product." },
      };
    }
    if (result.error.code === "23503") {
      return {
        ok: false,
        error: "Could not save the product.",
        fieldErrors: { category_id: "That category no longer exists." },
      };
    }
    return { ok: false, error: "The product could not be saved. Please try again." };
  }

  // 0. Free the primary slot first: the old primary may be a row the plan
  //    drops (or one whose flag flips later), and the partial unique index
  //    allows only a single is_primary=true row per product at any moment.
  const clearPrimary = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", idRaw)
    .eq("is_primary", true);
  if (clearPrimary.error) {
    await cleanupUploads();
    return { ok: false, error: "The image gallery could not be updated. Please try again." };
  }

  // 1. Update the rows the admin kept (alt text, order, primary flag).
  for (let index = 0; index < plan.length; index += 1) {
    const entry = plan[index];
    if (entry.kind !== "existing" || !entry.id) continue;
    const updateResult = await supabase
      .from("product_images")
      .update({
        alt_text: entry.alt || null,
        sort_order: index,
        is_primary: index === primaryIndex,
      })
      .eq("id", entry.id)
      .eq("product_id", idRaw);
    if (updateResult.error) {
      await cleanupUploads();
      return { ok: false, error: "The image gallery could not be updated. Please try again." };
    }
  }

  // 2. Insert the new files and the legacy single-image row (atomic).
  const rowsToInsert = plan
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.kind === "new" || entry.kind === "legacy")
    .map(({ entry, index }) => ({
      product_id: idRaw,
      image_path: resolvedPaths[index],
      alt_text: entry.alt || null,
      sort_order: index,
      is_primary: index === primaryIndex,
    }));
  if (rowsToInsert.length > 0) {
    const insertResult = await supabase.from("product_images").insert(rowsToInsert);
    if (insertResult.error) {
      // Single statement — atomic, so no row references the uploads yet.
      await cleanupUploads();
      return { ok: false, error: "The image gallery could not be updated. Please try again." };
    }
  }

  // 3. Remove the rows the admin dropped.
  const removedRowIds = currentRows
    .filter((current) => !keptRowIds.has(current.id))
    .map((current) => current.id);
  if (removedRowIds.length > 0) {
    const deleteResult = await supabase
      .from("product_images")
      .delete()
      .in("id", removedRowIds)
      .eq("product_id", idRaw);
    if (deleteResult.error) {
      // Product + gallery rows are consistent; uploads stay (they may be
      // referenced). The admin can retry the removal.
      return { ok: false, error: "Some images could not be removed. Please try again." };
    }
  }

  // 4. Storage cleanup — only after every database operation succeeded.
  const stillReferenced = new Set(resolvedPaths);
  if (primaryPath) stillReferenced.add(primaryPath);
  const pathsToDelete = new Set<string>();
  for (const current of currentRows) {
    if (!keptRowIds.has(current.id)) pathsToDelete.add(current.image_path);
  }
  const legacyKept = plan.some((entry) => entry.kind === "legacy");
  if (
    previousImagePath &&
    !legacyKept &&
    !currentRows.some((current) => current.image_path === previousImagePath)
  ) {
    // Virtual legacy image (or an orphaned pointer) no longer referenced.
    pathsToDelete.add(previousImagePath);
  }
  for (const path of pathsToDelete) {
    if (!stillReferenced.has(path)) await removeStoredImage(supabase, path);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?saved=1");
}

/** Flip is_published or is_featured from the product table. */
export async function toggleProductFieldAction(
  id: string,
  field: "is_published" | "is_featured",
  value: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid product id." };
  if (typeof value !== "boolean") return { ok: false, error: "Invalid value." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
  if (error) return { ok: false, error: "The update failed. Please try again." };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}

/** Delete a product (cascade removes image rows) + best-effort storage cleanup. */
export async function deleteProductAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid product id." };

  const supabase = await getSupabaseServerClient();
  const [existingResult, galleryResult] = await Promise.all([
    supabase.from("products").select("image_path").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("image_path").eq("product_id", id),
  ]);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: "The product could not be deleted. Please try again." };

  // Best-effort cleanup of every object the product referenced (primary
  // pointer + all gallery rows), deduped — the primary pointer normally
  // duplicates one of the row paths.
  const paths = new Set<string>();
  if (existingResult.data?.image_path) paths.add(existingResult.data.image_path);
  for (const item of galleryResult.data ?? []) {
    if (item.image_path) paths.add(item.image_path);
  }
  for (const path of paths) {
    await removeStoredImage(supabase, path);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}
