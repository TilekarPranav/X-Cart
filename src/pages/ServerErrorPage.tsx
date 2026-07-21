import { useNavigate } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui"

export default function ServerErrorPage() {
  const navigate = useNavigate()
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-6xl font-bold text-foreground">500</h1>
      <p className="mt-2 text-lg font-semibold text-foreground">Something went wrong</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred on our end. Please try again in a moment.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => window.location.reload()}>Retry</Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to home
        </Button>
      </div>
    </div>
  )
}
