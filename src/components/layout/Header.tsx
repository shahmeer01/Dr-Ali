"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import type { PublicCategory } from "@/lib/product-shared";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const productHref = "/products";
const animalCareHref = "/#animal-care";

const animalCareItems = [
  { name: "Pets & Companion Animals", href: "/pet-care" },
  { name: "Livestock & Farm Animals", href: "/livestock" },
  { name: "Wildlife & Exotic Animals", href: "/wildlife-exotic-animals" },
];

type DropdownItem = {
  name: string;
  href: string;
  /** Subcategories nested under this item (name-sorted, may be empty). */
  children?: DropdownItem[];
};

/** Dropdown destinations for a nav parent (null = plain link). */
function getDropdownItems(
  href: string,
  categories: PublicCategory[],
): DropdownItem[] | null {
  if (href === productHref) {
    // Hierarchy: top-level categories alphabetical, each with its active
    // subcategories nested beneath (recursively, to any depth). A child
    // whose parent is missing from the list (e.g. the parent is hidden)
    // surfaces at the top level.
    const byId = new Map(categories.map((category) => [category.id, category]));
    const childrenByParent = new Map<string, PublicCategory[]>();
    const roots: PublicCategory[] = [];
    for (const category of categories) {
      if (category.parent_category_id && byId.has(category.parent_category_id)) {
        const siblings =
          childrenByParent.get(category.parent_category_id) ?? [];
        siblings.push(category);
        childrenByParent.set(category.parent_category_id, siblings);
      } else {
        roots.push(category);
      }
    }
    const toItem = (category: PublicCategory): DropdownItem => {
      const children = (childrenByParent.get(category.id) ?? []).map(toItem);
      return {
        name: category.name,
        href: category.href,
        ...(children.length > 0 ? { children } : {}),
      };
    };
    return roots.map(toItem);
  }
  if (href === animalCareHref) return animalCareItems;
  return null;
}

/** Active-state rules: hash parents light up on their category pages. */
function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === animalCareHref) {
    return (
      pathname === "/pet-care" ||
      pathname === "/livestock" ||
      pathname === "/wildlife-exotic-animals"
    );
  }
  if (href === productHref) return pathname.startsWith(productHref);
  return pathname.startsWith(href);
}

/** Desktop nav link base: color + left-to-right underline on hover. */
const navLinkBase =
  "relative inline-flex items-center gap-1 rounded-control px-3 py-2 text-[14.5px] font-medium transition-[color] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] after:absolute after:inset-x-3 after:bottom-1.5 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-forest after:transition-transform after:duration-[220ms] after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest/50 focus-visible:after:scale-x-100";

/** Compact contact action shared by the WhatsApp and call icon buttons. */
const iconActionBase =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control transition-[background-color,border-color,color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-forest";

/**
 * Keeps a flyout submenu inside the viewport: negative margins pull the
 * panel back when it would cross the right or bottom edge. Measured from
 * the anchor row (never shifted itself), so there is no feedback loop.
 * Applied imperatively before paint — no state, no flash.
 */
function useSubmenuClamp(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!open) {
      el.style.marginLeft = "";
      el.style.marginTop = "";
      return;
    }
    const measure = () => {
      const anchor = el.parentElement; // the relative <li>
      if (!anchor) return;
      const anchorRect = anchor.getBoundingClientRect();
      const overflowX =
        anchorRect.right + el.offsetWidth - (window.innerWidth - 12);
      const overflowY =
        anchorRect.top + el.offsetHeight - (window.innerHeight - 12);
      el.style.marginLeft = overflowX > 0 ? `${-overflowX}px` : "";
      el.style.marginTop = overflowY > 0 ? `${-overflowY}px` : "";
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  return ref;
}

/** Shared link styling for a category row inside a desktop panel. */
const desktopItemLinkBase =
  "min-w-0 flex-1 rounded-control px-3 py-2 text-[14px] font-medium transition-[color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest/50";

/**
 * One category row in a desktop panel. Parents render a right-facing
 * chevron and a flyout submenu (recursively, to any depth) positioned to
 * the right of the row; leaves are plain links.
 */
function DesktopCategoryItem({
  item,
  depth,
  submenuPath,
  setSubmenuPath,
  pathname,
  onNavigate,
}: {
  item: DropdownItem;
  depth: number;
  submenuPath: string[];
  setSubmenuPath: Dispatch<SetStateAction<string[]>>;
  pathname: string;
  onNavigate: () => void;
}) {
  const hasChildren = !!item.children?.length;
  const open = hasChildren && submenuPath[depth] === item.href;
  const submenuRef = useSubmenuClamp(open);
  const active = pathname === item.href;

  const setPath = (updater: (prev: string[]) => string[]) =>
    setSubmenuPath(updater);
  // Ensure this level is open without truncating deeper entries — focus
  // events bubble up from nested rows and must not collapse them.
  const openPath = () =>
    setPath((prev) =>
      prev[depth] === item.href
        ? prev
        : [...prev.slice(0, depth), item.href],
    );
  const closePath = () =>
    setPath((prev) =>
      prev[depth] === item.href ? prev.slice(0, depth) : prev,
    );

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? openPath : undefined}
      onMouseLeave={hasChildren ? closePath : undefined}
      onFocus={hasChildren ? openPath : undefined}
      onBlur={
        hasChildren
          ? (event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              ) {
                closePath();
              }
            }
          : undefined
      }
    >
      <div className="group/row flex w-full items-center rounded-control transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-0.5 hover:bg-sage/50 focus-within:bg-sage/50">
        <Link
          href={item.href}
          className={cn(
            desktopItemLinkBase,
            "group-hover/row:text-forest",
            active
              ? "text-forest underline decoration-forest/40 decoration-[1.5px] underline-offset-4"
              : "text-charcoal/85",
          )}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          {item.name}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} ${item.name} subcategories`}
            // Keep the pointer-driven hover state authoritative: prevent
            // the click from moving focus onto the button (which would
            // re-open the submenu before the toggle runs).
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => (open ? closePath() : openPath())}
            className="mr-1.5 shrink-0 rounded-control p-1.5 text-charcoal/55 transition-[color,background-color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/70 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest/50"
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                open && "rotate-90",
              )}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
      {hasChildren ? (
        <div
          ref={submenuRef}
          className={cn(
            "absolute left-full top-0 z-50 pl-2 transition-[opacity,translate,visibility] duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            open
              ? "visible translate-x-0 opacity-100"
              : "invisible translate-x-1.5 opacity-0",
          )}
          role="group"
          aria-label={`${item.name} subcategories`}
        >
          <ul className="w-56 rounded-card border border-border-subtle bg-white p-2 shadow-card">
            {item.children!.map((child) => (
              <DesktopCategoryItem
                key={child.href}
                item={child}
                depth={depth + 1}
                submenuPath={submenuPath}
                setSubmenuPath={setSubmenuPath}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/** Shared link styling for a category row in the mobile accordion. */
const mobileItemLinkBase =
  "min-w-0 rounded-control px-3 py-2 text-[14px] font-medium transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest/50";

/**
 * One category row in the mobile menu. Parents keep their navigation link
 * and gain a separate chevron button that expands/collapses the children
 * (accordion — tap only, no hover); deeper levels recurse.
 */
function MobileCategoryItem({
  item,
  depth,
  expandedKeys,
  toggleExpanded,
  pathname,
  onNavigate,
}: {
  item: DropdownItem;
  depth: number;
  expandedKeys: string[];
  toggleExpanded: (key: string) => void;
  pathname: string;
  onNavigate: () => void;
}) {
  const hasChildren = !!item.children?.length;
  const expanded = hasChildren && expandedKeys.includes(item.href);
  const active = pathname === item.href;

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          className={cn(
            "block rounded-control px-3 py-2 text-[14px] font-medium transition-colors",
            active
              ? "text-forest underline decoration-forest/35 decoration-[1.5px] underline-offset-4"
              : depth === 0
                ? "text-charcoal/75"
                : "text-charcoal/65",
          )}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex w-full items-center">
        <Link
          href={item.href}
          className={cn(
            mobileItemLinkBase,
            "flex-1",
            active
              ? "text-forest underline decoration-forest/35 decoration-[1.5px] underline-offset-4"
              : depth === 0
                ? "text-charcoal/75"
                : "text-charcoal/65",
          )}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          {item.name}
        </Link>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} ${item.name} subcategories`}
          onClick={() => toggleExpanded(item.href)}
          className="shrink-0 rounded-control p-2 text-charcoal/60 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest/50"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>
      {expanded ? (
        <ul className="mb-1 ml-3 border-l border-border-subtle pl-2">
          {item.children!.map((child) => (
            <MobileCategoryItem
              key={child.href}
              item={child}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              toggleExpanded={toggleExpanded}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function Header({ categories }: { categories: PublicCategory[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  /** Hierarchy of open flyout submenus, outermost first (by category href). */
  const [submenuPath, setSubmenuPath] = useState<string[]>([]);
  /** Mobile accordion: expanded parent-category hrefs (any depth). */
  const [mobileExpanded, setMobileExpanded] = useState<string[]>([]);
  const pathname = usePathname();

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null);
    setSubmenuPath([]);
  }, []);
  const navigateAway = () => {
    setMenuOpen(false);
    closeDropdown();
  };
  const toggleMobileExpanded = (key: string) =>
    setMobileExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  // Close all navigation surfaces when the route changes (link clicks,
  // browser back/forward, programmatic navigation). Render-phase
  // adjustment per the React "storing information from previous renders"
  // pattern — no effect, no timeouts.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
    setSubmenuPath([]);
    setMobileExpanded([]);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape closes an open dropdown.
  useEffect(() => {
    if (!openDropdown) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openDropdown, closeDropdown]);

  // Pointer down outside any dropdown closes it.
  useEffect(() => {
    if (!openDropdown) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-nav-dropdown]")) {
        closeDropdown();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openDropdown, closeDropdown]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled
          ? "border-b border-border-subtle bg-ivory"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-6 md:h-[72px]">
          <Link
            href="/"
            className="group flex min-w-0 flex-col leading-tight"
            aria-label={`${siteConfig.name} home`}
          >
            <span className="truncate font-display text-[19px] font-medium tracking-[-0.01em] text-forest md:text-[21px]">
              {siteConfig.name}
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted sm:block">
              {siteConfig.tagline}
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {siteConfig.nav.map((item) => {
              const dropdownItems = getDropdownItems(item.href, categories);
              const active = isNavActive(pathname, item.href);

              if (dropdownItems) {
                const isOpen = openDropdown === item.href;
                return (
                  <div
                    key={item.href}
                    className="relative"
                    data-nav-dropdown=""
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => closeDropdown()}
                    onFocus={() => setOpenDropdown(item.href)}
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        closeDropdown();
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        navLinkBase,
                        active
                          ? "text-forest after:scale-x-100"
                          : "text-charcoal/80 hover:text-forest",
                      )}
                      aria-current={
                        active && item.href !== animalCareHref
                          ? "page"
                          : undefined
                      }
                      onClick={() => {
                        setMenuOpen(false);
                        setOpenDropdown(item.href);
                      }}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 opacity-60 transition-transform duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                          isOpen && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                    {/* Desktop dropdown: hover + keyboard focus, state-driven */}
                    <div
                      className={cn(
                        "absolute left-0 top-full z-50 pt-1 transition-[opacity,translate,visibility] duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen
                          ? "visible translate-y-0 opacity-100"
                          : "invisible translate-y-1.5 opacity-0",
                      )}
                      role="group"
                      aria-label={
                        item.href === productHref
                          ? "Product categories"
                          : "Animal care categories"
                      }
                    >
                      <ul className="w-56 rounded-card border border-border-subtle bg-white p-2 shadow-card">
                        {dropdownItems.map((dropdownItem) => (
                          <DesktopCategoryItem
                            key={dropdownItem.href}
                            item={dropdownItem}
                            depth={0}
                            submenuPath={submenuPath}
                            setSubmenuPath={setSubmenuPath}
                            pathname={pathname}
                            onNavigate={navigateAway}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navLinkBase,
                    active
                      ? "text-forest after:scale-x-100"
                      : "text-charcoal/80 hover:text-forest",
                  )}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waLink(
                "Hello Dr. Ali Ahmad, I would like to ask about veterinary care.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
              className={cn(
                iconActionBase,
                "bg-forest text-white hover:bg-[#1f4f41] active:bg-[#14332a]",
              )}
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </a>

            <a
              href={siteConfig.phoneHref}
              aria-label={`Call ${siteConfig.name} on ${siteConfig.phoneDisplay}`}
              title={`Call ${siteConfig.phoneDisplay}`}
              className={cn(
                iconActionBase,
                "border border-forest/25 bg-transparent text-forest hover:border-forest/60 hover:bg-forest/[0.04] active:bg-forest/[0.08]",
              )}
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-control text-charcoal transition-colors hover:bg-charcoal/[0.05] lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="border-t border-border-subtle bg-ivory lg:hidden"
      >
        <Container>
          <nav aria-label="Mobile" className="flex flex-col py-3">
            {siteConfig.nav.map((item) => {
              const dropdownItems = getDropdownItems(item.href, categories);
              const active = isNavActive(pathname, item.href);
              return (
                <div
                  key={item.href}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-1 py-3.5 text-[15px] font-medium",
                      active
                        ? "text-forest underline decoration-forest/40 decoration-[1.5px] underline-offset-4"
                        : "text-charcoal",
                    )}
                    aria-current={
                      active && item.href !== animalCareHref
                        ? "page"
                        : undefined
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {dropdownItems ? (
                    <ul className="mb-2 space-y-0.5 pl-4">
                      {dropdownItems.map((dropdownItem) => (
                        <MobileCategoryItem
                          key={dropdownItem.href}
                          item={dropdownItem}
                          depth={0}
                          expandedKeys={mobileExpanded}
                          toggleExpanded={toggleMobileExpanded}
                          pathname={pathname}
                          onNavigate={navigateAway}
                        />
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
            <Button
              href={siteConfig.whatsappUrl}
              size="md"
              variant="primary"
              className="mt-4 mb-2 w-full sm:hidden"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </Button>
          </nav>
        </Container>
      </div>
    </header>
  );
}
