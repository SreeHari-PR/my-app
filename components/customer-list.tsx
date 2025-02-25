"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Loader2, Pencil, Trash } from "lucide-react"
import { AddCustomerDialog } from "@/components/add-customer-dialog"
import { toast } from "sonner"

interface Customer {
  _id: string
  name: string
  address: string
  mobile: string
}

export function CustomerList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }
    fetchCustomers()
  }, [session, router])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      toast.error("Error fetching customers")
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomer = async (newCustomer: Omit<Customer, "_id">) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add customer")
      }

      toast.success("Customer added successfully")
      fetchCustomers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error adding customer")
    }
  }

  const handleEditCustomer = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/customers/${customer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customer.name,
          address: customer.address,
          mobile: customer.mobile,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update customer")
      }

      toast.success("Customer updated successfully")
      fetchCustomers()
      setIsAddDialogOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating customer")
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete customer")
      }

      toast.success("Customer deleted successfully")
      fetchCustomers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting customer")
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm),
  )

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedCustomer(null)
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditCustomer(customer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCustomer(customer._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AddCustomerDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          setSelectedCustomer(null)
        }}
        onSubmit={selectedCustomer ? handleEditCustomer : handleAddCustomer}
        customer={selectedCustomer}
      />
    </>
  )
}

