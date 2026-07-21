import { useNavigate } from "react-router-dom"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui"

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-6xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-lg font-semibold text-foreground">Page not found</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </p>
      <Button className="mt-8" onClick={() => navigate("/")}>
        Back to home
      </Button>
    </div>
  )
}
