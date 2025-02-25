import { InventoryList } from "@/components/inventory-list"

export default function Inventory() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-100">Inventory Management</h1>
      <InventoryList />
    </div>
  )
}

