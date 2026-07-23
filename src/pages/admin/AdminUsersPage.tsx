import { useState } from "react"
import { toast } from "sonner"
import { Trash2, ShieldCheck, Power } from "lucide-react"
import { useAdminUsers, useDeleteUser, useToggleUser } from "@/hooks/useAdmin"
import { getErrorMessage } from "@/services/http"
import type { AdminUser } from "@/types/api"
import { Badge, DataTable, Modal, Pagination, type Column } from "@/components/ui"
import { getPageMeta } from "@/utils/pagination"

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAdminUsers(page)
  const toggleUser = useToggleUser()
  const deleteUser = useDeleteUser()
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  async function toggle(u: AdminUser) {
    try {
      await toggleUser.mutateAsync({ id: u.id, enable: !u.enabled })
      toast.success(`${u.name} ${u.enabled ? "disabled" : "enabled"}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update user"))
    }
  }

  async function confirmAndDelete() {
    if (!confirmDelete) return
    try {
      await deleteUser.mutateAsync(confirmDelete.id)
      toast.success("User deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete user"))
    } finally {
      setConfirmDelete(null)
    }
  }

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium text-foreground">{u.name}</span> },
    { key: "email", header: "Email" },
    {
      key: "roles",
      header: "Roles",
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map((r) => (
            <Badge key={r} variant={r === "ROLE_ADMIN" ? "default" : "outline"}>
              {r === "ROLE_ADMIN" && <ShieldCheck className="mr-1 h-3 w-3" />}
              {r.replace("ROLE_", "")}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "enabled",
      header: "Status",
      render: (u) => <Badge variant={u.enabled ? "success" : "secondary"}>{u.enabled ? "Active" : "Disabled"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => toggle(u)}
            className="rounded-lg p-2 hover:bg-muted"
            aria-label={u.enabled ? "Disable user" : "Enable user"}
            title={u.enabled ? "Disable user" : "Enable user"}
          >
            <Power className={u.enabled ? "h-4 w-4 text-muted-foreground" : "h-4 w-4 text-success"} />
          </button>
          <button
            onClick={() => setConfirmDelete(u)}
            className="rounded-lg p-2 hover:bg-destructive/10"
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage customer and admin accounts.</p>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.content ?? []} loading={isLoading} emptyLabel="No users found." />
      </div>

      {data && getPageMeta(data).totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page + 1} totalPages={getPageMeta(data).totalPages} onChange={(p) => setPage(p - 1)} />
        </div>
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete user?">
        <p className="text-sm text-muted-foreground">
          This will permanently remove <strong>{confirmDelete?.name}</strong>&rsquo;s account. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => setConfirmDelete(null)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={confirmAndDelete}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
