import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@/utils/format"
import { categorySchema, type CategoryFormValues } from "@/utils/schemas"
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/useCatalog"
import { getErrorMessage } from "@/services/http"
import type { Category } from "@/types/api"
import { Button, DataTable, Input, Modal, type Column } from "@/components/ui"

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) })

  function openCreate() {
    setEditing(null)
    reset({ name: "", description: "" })
    setModalOpen(true)
  }
  function openEdit(c: Category) {
    setEditing(c)
    reset({ name: c.name, description: c.description })
    setModalOpen(true)
  }

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, payload: values })
        toast.success("Category updated")
      } else {
        await createCategory.mutateAsync(values)
        toast.success("Category created")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save category"))
    }
  }

  async function confirmAndDelete() {
    if (!confirmDelete) return
    try {
      await deleteCategory.mutateAsync(confirmDelete.id)
      toast.success("Category deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete category"))
    } finally {
      setConfirmDelete(null)
    }
  }

  const columns: Column<Category>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium text-foreground">{c.name}</span> },
    { key: "description", header: "Description" },
    { key: "createdAt", header: "Created", render: (c) => formatDate(c.createdAt) },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(c)} className="rounded-lg p-2 hover:bg-muted" aria-label="Edit category">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setConfirmDelete(c)}
            className="rounded-lg p-2 hover:bg-destructive/10"
            aria-label="Delete category"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-display text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your catalog into categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={categories ?? []} loading={isLoading} emptyLabel="No categories yet." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Input label="Description" error={errors.description?.message} {...register("description")} />
          <Button type="submit" className="w-full" loading={createCategory.isPending || updateCategory.isPending}>
            {editing ? "Save Changes" : "Create Category"}
          </Button>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete category?">
        <p className="text-sm text-muted-foreground">
          This will permanently remove <strong>{confirmDelete?.name}</strong>. Products in this category will not be deleted.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmAndDelete} loading={deleteCategory.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
