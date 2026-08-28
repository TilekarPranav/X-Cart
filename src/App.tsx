import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { RequireAdmin, RequireAuth, RedirectIfAuthed } from "@/components/layout/Guards"

import HomePage from "@/pages/HomePage"
import ProductListPage from "@/pages/ProductListPage"
import ProductDetailPage from "@/pages/ProductDetailPage"
import CategoriesPage from "@/pages/CategoriesPage"
import CartPage from "@/pages/CartPage"
import CheckoutPage from "@/pages/CheckoutPage"
import OrderSuccessPage from "@/pages/OrderSuccessPage"
import OrderFailedPage from "@/pages/OrderFailedPage"
import OrdersPage from "@/pages/OrdersPage"
import OrderDetailPage from "@/pages/OrderDetailPage"
import ProfilePage from "@/pages/ProfilePage"
import WishlistPage from "@/pages/WishlistPage"
import NotificationsPage from "@/pages/NotificationsPage"
import AboutPage from "@/pages/AboutPage"
import ContactPage from "@/pages/ContactPage"
import FaqPage from "@/pages/FaqPage"
import { PrivacyPage, TermsPage } from "@/pages/LegalPages"
import NotFoundPage from "@/pages/NotFoundPage"
import ServerErrorPage from "@/pages/ServerErrorPage"

import { lazy, Suspense } from "react"
import { Spinner } from "@/components/ui"

import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"

const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"))
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"))
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"))
const AdminCategoriesPage = lazy(() => import("@/pages/admin/AdminCategoriesPage"))
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"))
const AdminInventoryPage = lazy(() => import("@/pages/admin/AdminInventoryPage"))
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"))

function AdminFallback() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage mode="browse" />} />
        <Route path="/search" element={<ProductListPage mode="search" />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <RequireAuth>
              <OrderSuccessPage />
            </RequireAuth>
          }
        />
        <Route
          path="/order-failed"
          element={
            <RequireAuth>
              <OrderFailedPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <RequireAuth>
              <OrderDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthed>
              <RegisterPage />
            </RedirectIfAuthed>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLoginPage />
            </Suspense>
          }
        />
      </Route>

      {/* Admin console */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  )
}
