import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Lock } from "lucide-react"
import { loginSchema, type LoginValues } from "@/utils/schemas"
import { useAuth } from "@/context/AuthContext"
import { getErrorMessage } from "@/services/http"
import { Button, Checkbox, Input } from "@/components/ui"

export default function LoginPage() {
  const { login } = useAuth()
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
      await login({ email: values.email, password: values.password })
      toast.success("Welcome back!")
      navigate(params.get("next") ? decodeURIComponent(params.get("next")!) : "/")
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid email or password"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Log in to continue to X Cart.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@email.com"
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
        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" {...register("remember")} />
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
