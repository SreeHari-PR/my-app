"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Loader2, Pencil, Trash } from "lucide-react"
import { AddSaleDialog } from "@/components/add-sale-dialog"
import { toast } from "sonner"

interface Sale {
  _id: string
  date: string
  item: string
  quantity: number
  customer: string
  total: number
}

export function SalesList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchSales()
    }
  }, [status, router])

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales")
      if (!response.ok) {
        throw new Error("Failed to fetch sales")
      }
      const data = await response.json()
      setSales(data)
    } catch (error) {
      toast.error("Error fetching sales")
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSale = async (newSale: Omit<Sale, "_id">) => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSale),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add sale")
      }

      toast.success("Sale recorded successfully")
      fetchSales()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error recording sale")
    }
  }

  const handleEditSale = async (sale: Sale) => {
    try {
      const response = await fetch(`/api/sales/${sale._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: sale.date,
          item: sale.item,
          quantity: sale.quantity,
          customer: sale.customer,
          total: sale.total,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update sale")
      }

      toast.success("Sale updated successfully")
      fetchSales()
      setIsAddDialogOpen(false)
      setSelectedSale(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating sale")
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) {
      return
    }

    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete sale")
      }

      toast.success("Sale deleted successfully")
      fetchSales()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting sale")
    }
  }

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
        <Button
          onClick={() => {
            setSelectedSale(null)
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Record Sale
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No sales recorded
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.item}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>${sale.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedSale(sale)
                          setIsAddDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteSale(sale._id)}
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
      <AddSaleDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          setSelectedSale(null)
        }}
        onSubmit={selectedSale ? handleEditSale : handleAddSale}
        sale={selectedSale}
      />
    </>
  )
}

