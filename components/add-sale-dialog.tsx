"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Sale {
  _id: string
  date: string
  item: string
  quantity: number
  customer: string
  total: number
}

interface InventoryItem {
  _id: string
  name: string
  price: number
  quantity: number
}

interface AddSaleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (sale: Omit<Sale, "_id"> & { _id?: string }) => void
  sale?: Sale | null
}

export function AddSaleDialog({ isOpen, onClose, onSubmit, sale }: AddSaleDialogProps) {
  const [date, setDate] = useState("")
  const [item, setItem] = useState("")
  const [quantity, setQuantity] = useState("")
  const [customer, setCustomer] = useState("")
  const [total, setTotal] = useState("")
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [selectedItemPrice, setSelectedItemPrice] = useState<number>(0)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  useEffect(() => {
    if (sale) {
      setDate(new Date(sale.date).toISOString().split("T")[0])
      setItem(sale.item)
      setQuantity(sale.quantity.toString())
      setCustomer(sale.customer)
      setTotal(sale.total.toString())
    } else {
      setDate(new Date().toISOString().split("T")[0])
      setItem("")
      setQuantity("")
      setCustomer("")
      setTotal("")
    }
  }, [sale])

  useEffect(() => {
    if (item && quantity) {
      const selectedItem = inventoryItems.find((i) => i.name === item)
      if (selectedItem) {
        setSelectedItemPrice(selectedItem.price)
        setTotal((selectedItem.price * Number.parseInt(quantity)).toFixed(2))
      }
    }
  }, [item, quantity, inventoryItems])

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items")
      }
      const data = await response.json()
      setInventoryItems(data)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...sale,
      date,
      item,
      quantity: Number.parseInt(quantity),
      customer,
      total: Number.parseFloat(total),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sale ? "Edit Sale" : "Record New Sale"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
              <Select value={item} onValueChange={setItem}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item._id} value={item.name}>
                      {item.name} (${item.price.toFixed(2)} - {item.quantity} in stock)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                required
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">
                Total
              </Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="col-span-3"
                required
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{sale ? "Update" : "Record"} Sale</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

