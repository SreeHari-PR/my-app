import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard-charts"

// This would typically come from a database or API
const getDashboardData = async () => {
  return {
    totalItems: 1234,
    totalSales: 12345,
    totalCustomers: 567,
    // Add more data as needed
  }
}

export default async function Dashboard() {
  const { totalItems, totalSales, totalCustomers } = await getDashboardData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-100">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-800 border-emerald-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Items</CardTitle>
            <Package className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-100">{totalItems}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-emerald-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-100">${totalSales}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-emerald-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-100">{totalCustomers}</div>
          </CardContent>
        </Card>
      </div>
      <DashboardCharts />
    </div>
  )
}

