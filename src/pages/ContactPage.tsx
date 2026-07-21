import { useState } from "react"
import { toast } from "sonner"
import { Mail, MapPin, Phone } from "lucide-react"
import { APP } from "@/constants/app"
import { Button, Input, Textarea } from "@/components/ui"

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    setSubmitting(false)
    toast.success("Message sent — we'll get back to you within 24 hours.")
    e.currentTarget.reset()
  }

  return (
    <div className="container py-14">
      <h1 className="text-h2 font-display text-foreground">Contact Us</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Have a question about an order, a product, or anything else? We&rsquo;d love to help.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{APP.supportEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">+1 (555) 010-2024</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Office</p>
              <p className="text-sm text-muted-foreground">548 Market Street, San Francisco, CA</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" placeholder="Jane Doe" required />
            <Input label="Email" type="email" placeholder="you@email.com" required />
          </div>
          <Input label="Subject" placeholder="How can we help?" required />
          <Textarea label="Message" rows={5} placeholder="Tell us more..." required />
          <Button type="submit" loading={submitting}>
            Send message
          </Button>
        </form>
      </div>
    </div>
  )
}
