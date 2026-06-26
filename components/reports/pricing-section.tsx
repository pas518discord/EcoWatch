import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PRICING_TIERS } from "@/lib/reports-data"

export function PricingSection() {
  return (
    <section className="border-t border-gray-800 pt-10">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-semibold text-balance text-gray-50">
          Scale your climate intelligence
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-gray-400">
          Choose a plan that matches the number of regions and reporting cadence your team needs.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col rounded-xl border bg-gray-900 p-6",
              tier.highlighted
                ? "border-emerald-500 ring-1 ring-emerald-500/40"
                : "border-gray-800",
            )}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-gray-950">
                Most popular
              </span>
            )}
            <h3 className="font-heading text-lg font-semibold text-gray-50">{tier.name}</h3>
            <p className="mt-1 text-sm text-gray-400">{tier.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-gray-50">{tier.price}</span>
              {tier.cadence && <span className="text-sm text-gray-400">{tier.cadence}</span>}
            </div>
            <ul className="mt-5 flex flex-col gap-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="size-4 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={cn(
                "mt-6 w-full",
                tier.highlighted
                  ? "bg-emerald-500 text-gray-950 hover:bg-emerald-400"
                  : "border border-gray-700 bg-transparent text-gray-100 hover:bg-gray-800",
              )}
            >
              {tier.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
