import { useState } from "react"
import { toast } from "sonner"
import { Check, X } from "lucide-react"
import { useProducts } from "@/hooks/useCatalog"
import { useInventory, useUpdateInventory } from "@/hooks/useCommerce"
import { getErrorMessage } from "@/services/http"
import type { Product } from "@/types/api"
import { Badge, Input, Skeleton } from "@/components/ui"

// TODO: backend endpoint pending — there's no bulk "list inventory" endpoint,
// only GET/POST per product id, so each row independently fetches and updates
// its own stock level.
function InventoryRow({ product }: { product: Product }) {
  const { data: inventory, isLoading } = useInventory(product.id)
  const updateInventory = useUpdateInventory()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState("0")

  function startEdit() {
    setValue(String(inventory?.quantity ?? 0))
    setEditing(true)
  }

  async function save() {
    const quantity = Number(value)
    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Enter a valid, non-negative quantity")
      return
    }
    try {
      await updateInventory.mutateAsync({ productId: product.id, quantity })
      toast.success(`Stock updated for ${product.name}`)
      setEditing(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update inventory"))
    }
  }

  const lowStock = (inventory?.quantity ?? 0) > 0 && (inventory?.quantity ?? 0) < 8
  const outOfStock = inventory && !inventory.inStock

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/40">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">{product.name}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{product.categoryName}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-10" />
        ) : editing ? (
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-24"
            autoFocus
          />
        ) : (
          (inventory?.quantity ?? "—")
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {outOfStock ? (
          <Badge variant="destructive">Out of stock</Badge>
        ) : lowStock ? (
          <Badge variant="warning">Low stock</Badge>
        ) : (
          <Badge variant="success">In stock</Badge>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        {editing ? (
          <div className="flex justify-end gap-1">
            <button onClick={save} className="rounded-lg p-2 hover:bg-success/10" aria-label="Save">
              <Check className="h-4 w-4 text-success" />
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg p-2 hover:bg-muted" aria-label="Cancel">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button onClick={startEdit} className="text-xs font-medium text-primary hover:underline">
            Update
          </button>
        )}
      </td>
    </tr>
  )
}

export default function AdminInventoryPage() {
  const { data, isLoading } = useProducts({ size: 50 })

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Inventory</h1>
      <p className="mt-1 text-sm text-muted-foreground">Monitor and update stock levels per product.</p>

      <div className="mt-6 w-full overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="whitespace-nowrap px-4 py-3 font-medium text-muted-foreground">Product</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-muted-foreground">Quantity</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : (data?.content ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : (
              (data?.content ?? []).map((p) => <InventoryRow key={p.id} product={p} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
