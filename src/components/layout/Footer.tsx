import { Link } from "react-router-dom"
import { useState } from "react"
import { ShoppingCart, Camera, MessageCircle, Users, Play, CreditCard } from "lucide-react"
import { APP } from "@/constants/app"
import { Button, Input } from "@/components/ui"
import { toast } from "sonner"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Categories", to: "/categories" },
      { label: "New Arrivals", to: "/products?sort=new" },
      { label: "Best Sellers", to: "/products?sort=popular" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Track Order", to: "/orders" },
      { label: "Returns", to: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState("")

  function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    toast.success("You're subscribed! Watch your inbox for deals.")
    setEmail("")
  }

  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
                <ShoppingCart className="h-4 w-4" />
              </span>
              X<span className="text-gradient-brand">Cart</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{APP.tagline}</p>
            <form onSubmit={subscribe} className="mt-5 flex max-w-sm gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email for newsletter"
                className="h-10"
              />
              <Button type="submit">Subscribe</Button>
            </form>
            <div className="mt-5 flex gap-3 text-muted-foreground">
              <Camera className="h-4 w-4" />
              <MessageCircle className="h-4 w-4" />
              <Users className="h-4 w-4" />
              <Play className="h-4 w-4" />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <CreditCard className="h-5 w-5" />
            <span className="text-xs">Visa · Mastercard · UPI · PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
