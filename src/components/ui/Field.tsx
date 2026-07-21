import { forwardRef, useId } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"

/* ---------------------------------- Textarea --------------------------------- */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const autoId = useId()
    const tid = id ?? autoId
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={tid}
          ref={ref}
          className={cn(
            "flex min-h-[96px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = "Textarea"

/* ----------------------------------- Select ---------------------------------- */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const autoId = useId()
    const sid = id ?? autoId
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={sid} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={sid}
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              error && "border-destructive",
              className,
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)
Select.displayName = "Select"

/* ---------------------------------- Checkbox --------------------------------- */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = useId()
    const cid = id ?? autoId
    return (
      <label htmlFor={cid} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          id={cid}
          ref={ref}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-border text-primary accent-primary focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          {...props}
        />
        {label}
      </label>
    )
  },
)
Checkbox.displayName = "Checkbox"
