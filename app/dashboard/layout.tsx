import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Suspense } from "react"
import { PageLoader } from "@/components/page-loader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-zinc-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
    </div>
  )
}

