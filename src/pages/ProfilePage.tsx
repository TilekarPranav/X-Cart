import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Lock, Mail, ShieldCheck, User as UserIcon } from "lucide-react"
import { profileSchema, changePasswordSchema, type ProfileValues, type ChangePasswordValues } from "@/utils/schemas"
import { useAuth } from "@/context/AuthContext"
import { userService } from "@/services/auth.service"
import { getErrorMessage } from "@/services/http"
import { queryKeys } from "@/api/query-keys"
import { Button, Input, Tabs } from "@/components/ui"
import { initials } from "@/utils/format"

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState("profile")

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  })
  const [savingProfile, setSavingProfile] = useState(false)

  async function onSaveProfile(values: ProfileValues) {
    setSavingProfile(true)
    try {
      await userService.updateProfile(values)
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth })
      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update your profile"))
    } finally {
      setSavingProfile(false)
    }
  }

  const passwordForm = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) })
  const [savingPassword, setSavingPassword] = useState(false)

  async function onChangePassword(values: ChangePasswordValues) {
    setSavingPassword(true)
    try {
      await userService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      toast.success("Password changed successfully")
      passwordForm.reset()
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change your password"))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
          {user ? initials(user.name) : <UserIcon className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-h3 font-display text-foreground">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="mt-8">
        <Tabs
          items={[
            { value: "profile", label: "Profile", icon: <UserIcon className="h-4 w-4" /> },
            { value: "security", label: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div className="max-w-md py-6">
          {tab === "profile" && (
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4" noValidate>
              <Input
                label="Full name"
                leftIcon={<UserIcon className="h-4 w-4" />}
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register("name")}
              />
              <Input label="Email" leftIcon={<Mail className="h-4 w-4" />} value={user?.email ?? ""} disabled hint="Email cannot be changed." />
              <Button type="submit" loading={savingProfile}>
                Save changes
              </Button>
            </form>
          )}

          {tab === "security" && (
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
              <Input
                label="Current password"
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
              <Input
                label="New password"
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
              <Input
                label="Confirm new password"
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register("confirmPassword")}
              />
              <Button type="submit" loading={savingPassword}>
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
