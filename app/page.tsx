import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-900 relative overflow-hidden">
      <AnimatedBackground />

      <div className="z-10 text-center">
        <h1 className="text-4xl font-bold mb-8 text-emerald-100">Inventory Management System</h1>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-emerald-700 hover:bg-emerald-600 text-zinc-100">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="border-emerald-700 text-emerald-100 hover:bg-emerald-800">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

