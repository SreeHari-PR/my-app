"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Loader2, Pencil, Trash } from "lucide-react"
import { AddItemDialog } from "@/components/add-item-dialog"
import { toast } from "sonner"

interface InventoryItem {
  _id: string
  name: string
  description: string
  quantity: number
  price: number
}

export function InventoryList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchItems()
    }
  }, [status, router])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items")
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      toast.error("Error fetching inventory items")
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (newItem: Omit<InventoryItem, "_id">) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add item")
      }

      toast.success("Item added successfully")
      fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error adding item")
    }
  }

  const handleEditItem = async (item: InventoryItem) => {
    try {
      const response = await fetch(`/api/inventory/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update item")
      }

      toast.success("Item updated successfully")
      fetchItems()
      setIsAddDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating item")
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete item")
      }

      toast.success("Item deleted successfully")
      fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting item")
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedItem(null)
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedItem(item)
                          setIsAddDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteItem(item._id)}
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
      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={selectedItem ? handleEditItem : handleAddItem}
        item={selectedItem}
      />
    </>
  )
}

