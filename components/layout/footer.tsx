import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

const footerLinks = {
  programs: [
    { name: "Events", href: "/" },
  ],
  getInvolved: [
    { name: "Donate", href: "/" },
    { name: "Volunteer", href: "/volunteer" },
    { name: "Partner With Us", href: "/partner" },
  ],
}

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com/ultimateunited", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com/ultimateunited", icon: Instagram },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand & Contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
                ULTIMATE UNITED
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Making a difference everyday. A nonprofit organization dedicated to promoting education and providing resources to underprivileged communities in Hong Kong.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Hong Kong</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@ultimateunited.org" className="hover:text-foreground">
                  info@ultimateunited.org
                </a>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Programs
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.programs.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Get Involved
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ultimate United. All rights reserved. Registered Charity in Hong Kong.
          </p>
        </div>
      </div>
    </footer>
  )
}
