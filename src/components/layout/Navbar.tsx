import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Sun,
  Moon,
  LogOut,
  Package,
  LayoutDashboard,
  Bell,
  ChevronDown,
  Grid3x3,
} from "lucide-react"
import { cn } from "@/utils/cn"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useWishlist } from "@/context/WishlistContext"
import { useCategories } from "@/hooks/useCatalog"
import { useCart } from "@/hooks/useCommerce"
import { useDebounce, useRecentSearches } from "@/hooks/useUtils"
import { TRENDING_SEARCHES } from "@/constants/app"
import { Button, Drawer } from "@/components/ui"
import { CartDrawer } from "./CartDrawer"

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { count: wishlistCount } = useWishlist()
  const { data: cart } = useCart()
  const { data: categories } = useCategories()
  const { searches, add: addRecentSearch, clear: clearRecent } = useRecentSearches()

  const [query, setQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 250)
  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function submitSearch(term: string) {
    const clean = term.trim()
    if (!clean) return
    addRecentSearch(clean)
    setSearchFocused(false)
    setQuery("")
    navigate(`/search?q=${encodeURIComponent(clean)}`)
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center gap-4">
          {/* Mobile menu trigger */}
          <button
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">
              X<span className="text-gradient-brand">Cart</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <div className="relative">
              <button
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Grid3x3 className="h-4 w-4" />
                Categories
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {megaOpen && (
                <div
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                  className="absolute left-0 top-full w-[520px] rounded-xl border border-border bg-card p-4 shadow-floating"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {(categories ?? []).map((c) => (
                      <Link
                        key={c.id}
                        to={`/products?categoryId=${c.id}`}
                        onClick={() => setMegaOpen(false)}
                        className="rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              All Products
            </Link>
            <Link to="/categories" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Categories
            </Link>
          </nav>

          {/* Search */}
          <div ref={searchRef} className="relative ml-auto hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch(query)}
                placeholder="Search for products, brands, and more..."
                className="h-10 w-full rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search products"
              />
            </div>
            {searchFocused && (
              <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-border bg-card p-3 shadow-floating">
                {debouncedQuery.trim() ? (
                  <button
                    onClick={() => submitSearch(debouncedQuery)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    Search for &ldquo;{debouncedQuery}&rdquo;
                  </button>
                ) : (
                  <>
                    {searches.length > 0 && (
                      <div className="mb-2">
                        <div className="mb-1 flex items-center justify-between px-2">
                          <span className="text-xs font-medium text-muted-foreground">Recent searches</span>
                          <button onClick={clearRecent} className="text-xs text-primary hover:underline">
                            Clear
                          </button>
                        </div>
                        {searches.map((s) => (
                          <button
                            key={s}
                            onClick={() => submitSearch(s)}
                            className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="px-2 text-xs font-medium text-muted-foreground">Trending searches</div>
                    <div className="mt-1 flex flex-wrap gap-1.5 px-2 pt-1">
                      {TRENDING_SEARCHES.map((s) => (
                        <button
                          key={s}
                          onClick={() => submitSearch(s)}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              onClick={toggle}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted sm:flex"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <Link
              to="/wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                aria-label="Account menu"
                aria-expanded={accountOpen}
              >
                <User className="h-[18px] w-[18px]" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-floating">
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-border px-3 py-2">
                        <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <MenuLink to="/profile" icon={<User className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                        Profile
                      </MenuLink>
                      <MenuLink to="/orders" icon={<Package className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                        Orders
                      </MenuLink>
                      <MenuLink to="/notifications" icon={<Bell className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                        Notifications
                      </MenuLink>
                      {isAdmin && (
                        <MenuLink to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                          Admin Dashboard
                        </MenuLink>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          setAccountOpen(false)
                          navigate("/")
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <div className="p-1.5">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setAccountOpen(false)
                          navigate("/login")
                        }}
                      >
                        Log in
                      </Button>
                      <Button
                        variant="outline"
                        className="mt-1.5 w-full"
                        onClick={() => {
                          setAccountOpen(false)
                          navigate("/register")
                        }}
                      >
                        Create account
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile menu drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu" side="left">
        <div className="flex flex-col p-2">
          <div className="relative mb-2 p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitSearch(query)
                  setMobileOpen(false)
                }
              }}
              placeholder="Search products..."
              className="h-10 w-full rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm"
            />
          </div>
          <MenuLink to="/" onClick={() => setMobileOpen(false)}>
            Home
          </MenuLink>
          <MenuLink to="/products" onClick={() => setMobileOpen(false)}>
            All Products
          </MenuLink>
          <MenuLink to="/categories" onClick={() => setMobileOpen(false)}>
            Categories
          </MenuLink>
          <MenuLink to="/wishlist" onClick={() => setMobileOpen(false)}>
            Wishlist
          </MenuLink>
          {isAuthenticated ? (
            <>
              <MenuLink to="/profile" onClick={() => setMobileOpen(false)}>
                Profile
              </MenuLink>
              <MenuLink to="/orders" onClick={() => setMobileOpen(false)}>
                Orders
              </MenuLink>
              <MenuLink to="/notifications" onClick={() => setMobileOpen(false)}>
                Notifications
              </MenuLink>
              {isAdmin && (
                <MenuLink to="/admin" onClick={() => setMobileOpen(false)}>
                  Admin Dashboard
                </MenuLink>
              )}
              <button
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                  navigate("/")
                }}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2 p-1">
              <Button
                onClick={() => {
                  setMobileOpen(false)
                  navigate("/login")
                }}
              >
                Log in
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileOpen(false)
                  navigate("/register")
                }}
              >
                Create account
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  )
}

function MenuLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
      )}
    >
      {icon}
      {children}
    </Link>
  )
}
