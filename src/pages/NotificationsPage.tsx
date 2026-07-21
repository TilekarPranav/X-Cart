import { Bell, CheckCheck } from "lucide-react"
import { cn } from "@/utils/cn"
import { timeAgo } from "@/utils/format"
import { useMarkNotificationRead, useNotifications } from "@/hooks/useAdmin"
import { EmptyState, Skeleton } from "@/components/ui"

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-h2 font-display text-foreground">Notifications</h1>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="You're all caught up." />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {data.content.map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
                n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead.mutate(n.id)}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
