import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Lock } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordValues } from "@/utils/schemas"
import { Button, Input } from "@/components/ui"

// TODO: backend endpoint pending — the API contract has no /auth/reset-password
// route yet. The reset token would normally arrive as a query param and be sent
// with the new password once the endpoint exists.
export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const token = params.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    toast.success("Password reset. Please log in with your new password.")
    navigate("/login")
  }

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {token ? "Choose a strong new password for your account." : "This link is missing a reset token."}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="New password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm new password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Reset password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
