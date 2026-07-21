import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Lock, ShieldCheck } from "lucide-react"
import { loginSchema, type LoginValues } from "@/utils/schemas"
import { useAuth } from "@/context/AuthContext"
import { getErrorMessage } from "@/services/http"
import { Button, Input } from "@/components/ui"

export default function AdminLoginPage() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    setSubmitting(true)
    try {
      const authedUser = await login({ email: values.email, password: values.password })
      if (!authedUser.roles?.includes("ROLE_ADMIN")) {
        logout()
        toast.error("This account doesn't have admin access.")
        return
      }
      toast.success("Welcome to the admin console.")
      navigate(params.get("next") ? decodeURIComponent(params.get("next")!) : "/admin")
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid email or password"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-primary">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">Admin Console</span>
      </div>
      <h1 className="text-h3 font-display text-foreground">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Restricted area — administrators only.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="admin@xcart.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Sign in
        </Button>
      </form>
    </div>
  )
}
