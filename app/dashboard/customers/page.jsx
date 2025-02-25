import { CustomerList } from "@/components/customer-list"

export default function Customers() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-100">Customer Management</h1>
      <CustomerList />
    </div>
  )
}

