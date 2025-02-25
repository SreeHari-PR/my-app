import { SalesList } from "@/components/sales-list"

export default function Sales() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-100">Sales Management</h1>
      <SalesList />
    </div>
  )
}

