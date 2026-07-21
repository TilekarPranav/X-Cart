import { APP } from "@/constants/app"

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <p>
        {APP.name} ("we", "us") respects your privacy. This policy explains what information we collect, how we use
        it, and the choices you have.
      </p>
      <h2>Information we collect</h2>
      <p>
        We collect information you provide directly (like your name, email, and shipping address), information about
        your orders, and basic usage data such as pages viewed and device type.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your information to process orders, provide customer support, improve our products, and — with your
        consent — send you updates about offers and new arrivals.
      </p>
      <h2>Sharing</h2>
      <p>
        We share information only with the service providers needed to fulfill your order (payment processors,
        shipping carriers) and never sell your personal data to third parties.
      </p>
      <h2>Your choices</h2>
      <p>
        You can update or delete your account information at any time from your profile, and unsubscribe from
        marketing emails using the link in any message.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <a href={`mailto:${APP.supportEmail}`}>{APP.supportEmail}</a>.
      </p>
    </LegalLayout>
  )
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="July 2026">
      <p>
        By using {APP.name}, you agree to these terms. Please read them carefully before placing an order.
      </p>
      <h2>Orders and payment</h2>
      <p>
        All orders are subject to product availability. Prices are shown in the currency of your storefront and may
        change without notice, though confirmed orders are honored at the price paid.
      </p>
      <h2>Shipping and delivery</h2>
      <p>
        Delivery estimates are provided in good faith but are not guaranteed. Risk of loss passes to you upon
        delivery to the shipping address you provide.
      </p>
      <h2>Returns</h2>
      <p>
        Eligible items may be returned within 30 days of delivery in their original condition. See our FAQ for full
        details on the return process.
      </p>
      <h2>Account responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activity
        under your account.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        {APP.name} is not liable for indirect or consequential damages arising from use of the service, to the
        fullest extent permitted by law.
      </p>
    </LegalLayout>
  )
}

function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container max-w-2xl py-14">
      <h1 className="text-h2 font-display text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="prose prose-sm mt-8 max-w-none space-y-4 text-sm leading-relaxed text-foreground [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_a]:text-primary [&_a]:underline-offset-2 [&_p]:text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
