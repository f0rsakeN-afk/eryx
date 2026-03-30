import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggler";

const links = {
  product: [
    { label: "Pricing", href: "/pricing" },
    { label: "Status", href: "/status" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [{ label: "Contact", href: "/contact" }],
  legal: [
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/policy" },
  ],
} as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex w-fit text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      {label}
      <span className="absolute -bottom-px left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* Top */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-3">
            {/* Logo placeholder — replace with actual logo */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-foreground" />
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Nothing
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Simple, fast, and reliable. Built for people who care about the
              details.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Product
            </p>
            <nav className="flex flex-col gap-3">
              {links.product.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Company
            </p>
            <nav className="flex flex-col gap-3">
              {links.company.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Legal
            </p>
            <nav className="flex flex-col gap-3">
              {links.legal.map((l) => (
                <FooterLink key={l.href} {...l} />
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nothing. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
