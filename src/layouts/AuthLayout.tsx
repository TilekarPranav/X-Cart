import { Link, Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-elevated px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <ShoppingCart className="h-5 w-5" />
          </span>
          X<span className="text-gradient-brand">Cart</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-2xl border border-border bg-card p-8 shadow-card"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
