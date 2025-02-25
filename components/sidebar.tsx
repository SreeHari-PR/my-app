"use client"

import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, LogOut } from "lucide-react"
import { useState } from "react"

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Sales", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigation = (href: string) => {
    setIsNavigating(true)
    router.push(href)
  }

  const handleSignOut = async () => {
    setIsNavigating(true)
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="flex h-full w-64 flex-col bg-emerald-900 text-white">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">IMS</h2>
      </div>
      <div className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Button
              key={link.name}
              variant="ghost"
              className={cn(
                "w-full justify-start text-zinc-100 hover:bg-emerald-800 hover:text-white",
                pathname === link.href && "bg-emerald-800 text-white",
              )}
              onClick={() => handleNavigation(link.href)}
              disabled={isNavigating}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span className="text-sm font-medium">{link.name}</span>
            </Button>
          )
        })}
      </div>
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-100 hover:bg-emerald-800 hover:text-white"
          onClick={handleSignOut}
          disabled={isNavigating}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )
}

