"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { productCategories } from "@/data/products";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const productHref = "/products";
const animalCareHref = "/#animal-care";

const animalCareItems = [
  { name: "Pets & Companion Animals", href: "/pet-care" },
  { name: "Livestock & Farm Animals", href: "/livestock" },
  { name: "Wildlife & Exotic Animals", href: "/wildlife-exotic-animals" },
];

type DropdownItem = { name: string; href: string };

/** Dropdown destinations for a nav parent (null = plain link). */
function getDropdownItems(href: string): DropdownItem[] | null {
  if (href === productHref) {
    return productCategories.map((category) => ({
      name: category.name,
      href: category.href,
    }));
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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Close all navigation surfaces when the route changes (link clicks,
  // browser back/forward, programmatic navigation). Render-phase
  // adjustment per the React "storing information from previous renders"
  // pattern — no effect, no timeouts.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
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
      if (event.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openDropdown]);

  // Pointer down outside any dropdown closes it.
  useEffect(() => {
    if (!openDropdown) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-nav-dropdown]")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openDropdown]);

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
              const dropdownItems = getDropdownItems(item.href);
              const active = isNavActive(pathname, item.href);

              if (dropdownItems) {
                const isOpen = openDropdown === item.href;
                return (
                  <div
                    key={item.href}
                    className="relative"
                    data-nav-dropdown=""
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() =>
                      setOpenDropdown((cur) =>
                        cur === item.href ? null : cur,
                      )
                    }
                    onFocus={() => setOpenDropdown(item.href)}
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        setOpenDropdown((cur) =>
                          cur === item.href ? null : cur,
                        );
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
                          <li key={dropdownItem.href}>
                            <Link
                              href={dropdownItem.href}
                              className={cn(
                                "block rounded-control px-3 py-2 text-[14px] font-medium transition-[color,background-color,translate] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest/50 hover:translate-x-0.5 hover:bg-sage/50 hover:text-forest",
                                pathname === dropdownItem.href
                                  ? "text-forest underline decoration-forest/40 decoration-[1.5px] underline-offset-4"
                                  : "text-charcoal/85",
                              )}
                              aria-current={
                                pathname === dropdownItem.href
                                  ? "page"
                                  : undefined
                              }
                              onClick={() => {
                                setMenuOpen(false);
                                setOpenDropdown(null);
                              }}
                            >
                              {dropdownItem.name}
                            </Link>
                          </li>
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
              const dropdownItems = getDropdownItems(item.href);
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
                        <li key={dropdownItem.href}>
                          <Link
                            href={dropdownItem.href}
                            className={cn(
                              "block rounded-control px-3 py-2 text-[14px] font-medium",
                              pathname === dropdownItem.href
                                ? "text-forest underline decoration-forest/35 decoration-[1.5px] underline-offset-4"
                                : "text-charcoal/75",
                            )}
                            aria-current={
                              pathname === dropdownItem.href
                                ? "page"
                                : undefined
                            }
                            onClick={() => setMenuOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        </li>
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
