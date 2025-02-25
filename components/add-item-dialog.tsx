"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface InventoryItem {
  _id: string
  name: string
  description: string
  quantity: number
  price: number
}

interface AddItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: Omit<InventoryItem, "_id"> & { _id?: string }) => void
  item?: InventoryItem | null
}

export function AddItemDialog({ isOpen, onClose, onSubmit, item }: AddItemDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")

  useEffect(() => {
    if (item) {
      setName(item.name)
      setDescription(item.description)
      setQuantity(item.quantity.toString())
      setPrice(item.price.toString())
    } else {
      setName("")
      setDescription("")
      setQuantity("")
      setPrice("")
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...item,
      name,
      description,
      quantity: Number.parseInt(quantity),
      price: Number.parseFloat(price),
    })
    setName("")
    setDescription("")
    setQuantity("")
    setPrice("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
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
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
                required
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{item ? "Update" : "Add"} Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

