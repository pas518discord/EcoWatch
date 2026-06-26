"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Leaf, Loader2, LogIn } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [email, setEmail] = useState("demo@ecowatch.io")
  const [password, setPassword] = useState("demo123")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError("Invalid email or password")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Leaf className="size-6" />
          </div>
          <h1 className="text-lg font-semibold text-gray-100">EcoWatch</h1>
          <p className="mt-1 text-sm text-gray-400">
            Sign in to your climate intelligence dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none transition-colors focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-gray-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none transition-colors focus:border-emerald-500/60"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-center text-[11px] text-gray-500">
          Demo account — <span className="text-gray-300">demo@ecowatch.io</span> /{" "}
          <span className="text-gray-300">demo123</span>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
