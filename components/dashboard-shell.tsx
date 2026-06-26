"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"

export function DashboardShell({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
          {title && (
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
