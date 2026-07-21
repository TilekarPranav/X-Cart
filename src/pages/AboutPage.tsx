import { Sparkles, Users, Globe2, Award } from "lucide-react"
import { APP } from "@/constants/app"

const stats = [
  { icon: Users, value: "2M+", label: "Happy customers" },
  { icon: Globe2, value: "40+", label: "Countries served" },
  { icon: Award, value: "4.8/5", label: "Average rating" },
  { icon: Sparkles, value: "10k+", label: "Curated products" },
]

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-brand py-16 text-center text-white">
        <div className="container">
          <h1 className="text-h1 font-display">About {APP.name}</h1>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-white/85">{APP.tagline}</p>
        </div>
      </section>

      <section className="container py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h3 font-display text-foreground">Our story</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {APP.name} started with a simple idea: shopping online should feel as good as unboxing your favorite
            product. We partner with brands we trust, obsess over the details of delivery and support, and build
            technology that gets out of your way — so you can find what you need and get on with your day.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center">
              <s.icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
