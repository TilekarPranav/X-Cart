import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard shipping takes 5-7 business days. Express shipping arrives in 1-2 business days. You'll get tracking details as soon as your order ships.",
  },
  {
    q: "What is your return policy?",
    a: "You can return most items within 30 days of delivery for a full refund, as long as they're unused and in their original packaging.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards, UPI, net banking, popular digital wallets, and cash on delivery in eligible regions.",
  },
  {
    q: "How do I track my order?",
    a: "Go to Orders in your account menu and select the order you want to track. You'll see a live status timeline there.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Orders can be cancelled from the order detail page as long as they haven't shipped yet. Once an order ships, it can no longer be modified.",
  },
]

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="container max-w-2xl py-14">
      <h1 className="text-h2 font-display text-foreground">Frequently Asked Questions</h1>
      <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-foreground">{faq.q}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
