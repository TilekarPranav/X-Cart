import { useNavigate } from "react-router-dom"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui"

export default function OrderFailedPage() {
  const navigate = useNavigate()
  return (
    <div className="container flex flex-col items-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <XCircle className="h-9 w-9" />
      </div>
      <h1 className="mt-6 text-h2 font-display text-foreground">We couldn&rsquo;t complete your order</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Something went wrong while placing your order. Your card has not been charged. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate("/checkout")}>Try again</Button>
        <Button variant="outline" onClick={() => navigate("/cart")}>
          Back to cart
        </Button>
      </div>
    </div>
  )
}
