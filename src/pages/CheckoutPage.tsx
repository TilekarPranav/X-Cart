import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check, CreditCard, Landmark, Smartphone, Wallet, Banknote } from "lucide-react"
import { cn } from "@/utils/cn"
import { formatCurrency } from "@/utils/format"
import { addressSchema, type AddressValues } from "@/utils/schemas"
import { useCart, usePay, usePlaceOrder } from "@/hooks/useCommerce"
import { getErrorMessage } from "@/services/http"
import { Button, Input } from "@/components/ui"

type Step = "address" | "shipping" | "payment" | "review"
const steps: { key: Step; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
]

type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "WALLET" | "COD"
const paymentMethods: { value: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { value: "CARD", label: "Credit / Debit Card", icon: CreditCard },
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "NETBANKING", label: "Net Banking", icon: Landmark },
  { value: "WALLET", label: "Wallet", icon: Wallet },
  { value: "COD", label: "Cash on Delivery", icon: Banknote },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart } = useCart()
  const placeOrder = usePlaceOrder()
  const pay = usePay()

  const [step, setStep] = useState<Step>("address")
  const [shippingSpeed, setShippingSpeed] = useState<"standard" | "express">("standard")
  const [method, setMethod] = useState<PaymentMethod>("CARD")
  const [placing, setPlacing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AddressValues>({ resolver: zodResolver(addressSchema) })

  const total = cart?.totalAmount ?? 0
  const shippingCost = shippingSpeed === "express" ? 14.99 : total >= 50 ? 0 : 6.99
  const tax = Math.round(total * 0.08 * 100) / 100
  const grandTotal = total + shippingCost + tax

  const stepIndex = steps.findIndex((s) => s.key === step)

  function goNext() {
    const idx = steps.findIndex((s) => s.key === step)
    if (idx < steps.length - 1) setStep(steps[idx + 1].key)
  }
  function goBack() {
    const idx = steps.findIndex((s) => s.key === step)
    if (idx > 0) setStep(steps[idx - 1].key)
  }

  async function placeOrderAndPay() {
    setPlacing(true)
    try {
      const order = await placeOrder.mutateAsync()
      // Cash on Delivery skips the payment gateway; every other method charges now.
      if (method !== "COD") {
        await pay.mutateAsync({ orderId: order.id, method })
      }
      toast.success("Order placed successfully!")
      navigate(`/order-success/${order.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not place your order"))
      navigate("/order-failed")
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-h2 font-display text-foreground">Checkout</h1>

      {/* Progress bar */}
      <div className="mt-6 flex items-center">
        {steps.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  i < stepIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === stepIndex
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium", i <= stepIndex ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1", i < stepIndex ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          {step === "address" && (
            <form
              onSubmit={handleSubmit(goNext)}
              className="space-y-4"
              noValidate
            >
              <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
                <Input label="Phone number" error={errors.phone?.message} {...register("phone")} />
              </div>
              <Input label="Address line 1" error={errors.line1?.message} {...register("line1")} />
              <Input label="Address line 2 (optional)" {...register("line2")} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="City" error={errors.city?.message} {...register("city")} />
                <Input label="State" error={errors.state?.message} {...register("state")} />
                <Input label="Postal code" error={errors.postalCode?.message} {...register("postalCode")} />
              </div>
              <Input label="Country" error={errors.country?.message} {...register("country")} />
              <Button type="submit" className="w-full sm:w-auto">
                Continue to Shipping
              </Button>
            </form>
          )}

          {step === "shipping" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Shipping Method</h2>
              {(
                [
                  { key: "standard", label: "Standard Shipping", eta: "5-7 business days", price: total >= 50 ? 0 : 6.99 },
                  { key: "express", label: "Express Shipping", eta: "1-2 business days", price: 14.99 },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setShippingSpeed(opt.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                    shippingSpeed === opt.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.eta}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {opt.price === 0 ? "Free" : formatCurrency(opt.price)}
                  </span>
                </button>
              ))}
              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={goNext}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                      method === m.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                    )}
                  >
                    <m.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
              {method === "CARD" && (
                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <Input label="Card number" placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
                  <Input label="Expiry" placeholder="MM/YY" />
                  <Input label="CVV" placeholder="123" type="password" maxLength={4} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={goNext}>Review Order</Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Review & Place Order</h2>
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <p className="font-medium text-foreground">{getValues("fullName") || "—"}</p>
                <p className="text-muted-foreground">
                  {getValues("line1")}
                  {getValues("line2") ? `, ${getValues("line2")}` : ""}, {getValues("city")}, {getValues("state")}{" "}
                  {getValues("postalCode")}, {getValues("country")}
                </p>
                <p className="text-muted-foreground">{getValues("phone")}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <p className="text-foreground">
                  Shipping: <strong>{shippingSpeed === "express" ? "Express" : "Standard"}</strong>
                </p>
                <p className="text-foreground">
                  Payment: <strong>{paymentMethods.find((m) => m.value === method)?.label}</strong>
                </p>
              </div>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {(cart?.items ?? []).map((item) => (
                  <li key={item.cartItemId} className="flex justify-between p-3 text-sm">
                    <span className="text-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} disabled={placing}>
                  Back
                </Button>
                <Button onClick={placeOrderAndPay} loading={placing} className="flex-1">
                  Place Order — {formatCurrency(grandTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated tax</span>
              <span className="text-foreground">{formatCurrency(tax)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
