import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatImageUrl } from "@/utils/format"
import { productSchema, type ProductFormValues } from "@/utils/schemas"
import { useCategories, useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct, useUploadProductImage } from "@/hooks/useCatalog"
import { getErrorMessage } from "@/services/http"
import type { Product } from "@/types/api"
import { Badge, Button, DataTable, Input, Modal, Select, type Column } from "@/components/ui"

export default function AdminProductsPage() {
  const { data, isLoading } = useProducts({ size: 50 })
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)

  const uploadImage = useUploadProductImage()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof productSchema>, unknown, ProductFormValues>({ resolver: zodResolver(productSchema) })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadImage.mutateAsync(file)
      setValue("imageUrl", path)
      toast.success("Image uploaded successfully!")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not upload image"))
    } finally {
      setUploading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    reset({ name: "", description: "", price: 0, imageUrl: "/placeholder.svg", categoryId: categories?.[0]?.id })
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    reset({ name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl, categoryId: p.categoryId })
    setModalOpen(true)
  }

  async function onSubmit(values: ProductFormValues) {
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, payload: values })
        toast.success("Product updated")
      } else {
        await createProduct.mutateAsync(values)
        toast.success("Product created")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save product"))
    }
  }

  async function confirmAndDelete() {
    if (!confirmDelete) return
    try {
      await deleteProduct.mutateAsync(confirmDelete.id)
      toast.success("Product deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete product"))
    } finally {
      setConfirmDelete(null)
    }
  }

  const columns: Column<Product>[] = [
    { key: "name", header: "Name", render: (p) => <span className="font-medium text-foreground">{p.name}</span> },
    { key: "categoryName", header: "Category" },
    { key: "price", header: "Price", render: (p) => formatCurrency(p.price) },
    {
      key: "active",
      header: "Status",
      render: (p) => <Badge variant={p.active ? "success" : "secondary"}>{p.active ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(p)} className="rounded-lg p-2 hover:bg-muted" aria-label="Edit product">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setConfirmDelete(p)} className="rounded-lg p-2 hover:bg-destructive/10" aria-label="Delete product">
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
          <h1 className="text-h3 font-display text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Product
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.content ?? []} loading={isLoading} emptyLabel="No products yet." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "New Product"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Input label="Description" error={errors.description?.message} {...register("description")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register("price")} />
            <Select
              label="Category"
              error={errors.categoryId?.message}
              options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
              {...register("categoryId")}
            />
          </div>
          {watch("imageUrl") && (
            <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              <img
                src={formatImageUrl(watch("imageUrl"))}
                alt="Product preview"
                className="h-full object-contain p-2"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Product Image</label>
            <div className="flex gap-3">
              <Input
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl?.message}
                {...register("imageUrl")}
                className="flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  id="image-file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  loading={uploading}
                  onClick={() => document.getElementById("image-file-upload")?.click()}
                  className="h-10"
                >
                  Upload File
                </Button>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" loading={createProduct.isPending || updateProduct.isPending}>
            {editing ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete product?">
        <p className="text-sm text-muted-foreground">
          This will permanently remove <strong>{confirmDelete?.name}</strong>. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmAndDelete} loading={deleteProduct.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
