import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Lock, User } from "lucide-react"
import { registerSchema, type RegisterValues } from "@/utils/schemas"
import { useAuth } from "@/context/AuthContext"
import { getErrorMessage } from "@/services/http"
import { Button, Checkbox, Input } from "@/components/ui"

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true)
    try {
      // Strip client-only fields (confirmPassword, terms) before sending to the API.
      await registerUser({ name: values.name, email: values.email, password: values.password })
      toast.success("Account created — welcome to X Cart!")
      navigate("/")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create your account"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join X Cart for a faster, personalized shopping experience.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="Full name"
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register("name")}
        />
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
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Checkbox label="I agree to the Terms of Service and Privacy Policy" {...register("terms")} />
        {errors.terms && <p className="-mt-2 text-xs text-destructive">{errors.terms.message}</p>}
        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
